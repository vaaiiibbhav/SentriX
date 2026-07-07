"""
SentriX Local ML Scoring Service
Uses sentence-transformers for semantic similarity scoring.
Runs on port 5001 as a Flask microservice.

Install: pip install flask flask-cors sentence-transformers torch numpy
Run:     python scoring_service.py
"""

import os
import json
import logging
from typing import Optional

from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Lazy-load model to avoid slow startup if not needed
_model = None
_model_name = os.environ.get('SCORING_MODEL', 'all-MiniLM-L6-v2')


def get_model():
    """Lazy-load the sentence-transformer model."""
    global _model
    if _model is None:
        logger.info(f"Loading sentence-transformer model: {_model_name}")
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(_model_name)
            logger.info("Model loaded successfully")
        except ImportError:
            logger.warning("sentence-transformers not installed. Using keyword fallback.")
            return None
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return None
    return _model


def compute_semantic_score(document_text: str, clause_description: str, keywords: list[str], guidance: str = "") -> dict:
    """
    Compute semantic similarity between a document and a clause.
    Returns a score 0-100 and confidence level.
    """
    model = get_model()

    if model is None:
        # Keyword fallback when model unavailable
        return keyword_fallback_score(document_text, keywords)

    import numpy as np

    # Build the clause reference text from description + guidance + keywords
    clause_text = f"{clause_description}. {guidance}. Keywords: {', '.join(keywords)}"

    # Encode both texts
    embeddings = model.encode([document_text[:4096], clause_text], convert_to_numpy=True, show_progress_bar=False)

    # Cosine similarity
    similarity = float(np.dot(embeddings[0], embeddings[1]) / (
        np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1]) + 1e-8
    ))

    # Scale similarity to 0-100 (typical cosine sim for this model: 0.0-0.8)
    raw_score = max(0, min(100, similarity * 125))

    # Boost score with keyword matching
    keyword_score = keyword_match_ratio(document_text, keywords) * 100
    blended_score = round(raw_score * 0.7 + keyword_score * 0.3)
    blended_score = max(0, min(100, blended_score))

    # Determine confidence
    if similarity > 0.6:
        confidence = "high"
    elif similarity > 0.35:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "score": blended_score,
        "semanticSimilarity": round(similarity, 4),
        "keywordMatchRatio": round(keyword_match_ratio(document_text, keywords), 4),
        "confidence": confidence,
        "method": "ml-semantic",
    }


def keyword_fallback_score(document_text: str, keywords: list[str]) -> dict:
    """Score based on keyword presence when ML model is unavailable."""
    ratio = keyword_match_ratio(document_text, keywords)
    score = round(ratio * 100)

    if ratio > 0.7:
        confidence = "medium"
    elif ratio > 0.4:
        confidence = "low"
    else:
        confidence = "very-low"

    return {
        "score": score,
        "semanticSimilarity": 0,
        "keywordMatchRatio": round(ratio, 4),
        "confidence": confidence,
        "method": "keyword-fallback",
    }


def keyword_match_ratio(text: str, keywords: list[str]) -> float:
    """Calculate the ratio of keywords found in the text."""
    if not keywords:
        return 0.0
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if kw.lower() in text_lower)
    return matches / len(keywords)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    model = get_model()
    return jsonify({
        "status": "ok",
        "model": _model_name,
        "modelLoaded": model is not None,
        "service": "SentriX ML Scoring",
        "version": "1.0.0",
    })


@app.route('/score', methods=['POST'])
def score_single():
    """Score a single clause against a document."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    document_text = data.get('documentText', '')
    clause_description = data.get('clauseDescription', '')
    keywords = data.get('keywords', [])
    guidance = data.get('guidance', '')

    if not document_text:
        return jsonify({"error": "documentText is required"}), 400
    if not clause_description:
        return jsonify({"error": "clauseDescription is required"}), 400

    result = compute_semantic_score(document_text, clause_description, keywords, guidance)
    return jsonify(result)


@app.route('/score-all', methods=['POST'])
def score_all():
    """Score multiple clauses against a document in batch."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    document_text = data.get('documentText', '')
    clauses = data.get('clauses', [])

    if not document_text:
        return jsonify({"error": "documentText is required"}), 400
    if not clauses:
        return jsonify({"error": "clauses array is required"}), 400

    results = []
    for clause in clauses:
        clause_id = clause.get('id', 'unknown')
        clause_description = clause.get('description', '')
        keywords = clause.get('keywords', [])
        guidance = clause.get('guidance', '')

        score_result = compute_semantic_score(document_text, clause_description, keywords, guidance)
        score_result['clauseId'] = clause_id
        score_result['clauseTitle'] = clause.get('title', '')
        results.append(score_result)

    # Compute aggregate stats
    scores = [r['score'] for r in results]
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    return jsonify({
        "results": results,
        "aggregate": {
            "averageScore": avg_score,
            "totalClauses": len(results),
            "highConfidence": sum(1 for r in results if r['confidence'] == 'high'),
            "mediumConfidence": sum(1 for r in results if r['confidence'] == 'medium'),
            "lowConfidence": sum(1 for r in results if r['confidence'] in ('low', 'very-low')),
        },
    })


if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    logger.info(f"Starting SentriX ML Scoring Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
