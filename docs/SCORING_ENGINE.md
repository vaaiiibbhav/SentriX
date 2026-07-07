# 3-Tier Hybrid Scoring Engine

## Overview

The `HybridScoringService` is SentriX's novel scoring engine that implements a **multi-tiered approach to compliance clause scoring**. It gracefully degrades across three tiers, ensuring the application always produces meaningful results regardless of which external services are available.

This is fundamentally different from a single-LLM approach. Instead of asking one model to produce a score, the engine combines **machine learning semantic analysis**, **LLM-powered contextual refinement**, and **deterministic keyword matching** to produce high-confidence, auditable scores.

## Architecture

```
Document Text + Standard Clauses
         │
         ▼
┌────────────────────────────────────────────────────┐
│  Tier 1: ML Semantic Scoring                        │
│  (Python microservice with sentence-transformers)   │
│                                                      │
│  • Computes semantic similarity between document     │
│    text and each clause's description/guidance       │
│  • Returns score + confidence per clause             │
│  • Timeout: 30 seconds                              │
│                                                      │
│  Available? ───┬──── YES ──→ ML scores obtained     │
│                │                    │                 │
│                NO                   ▼                 │
│                │     ┌──────────────────────────┐    │
│                │     │ Tier 2: Claude Enhancement│    │
│                │     │                           │    │
│                │     │ • Takes ML/keyword scores  │    │
│                │     │ • Refines with document    │    │
│                │     │   context understanding    │    │
│                │     │ • Returns adjusted scores  │    │
│                │     │   + specific findings      │    │
│                │     │                           │    │
│                │     │ Available? ─┬── YES ──→   │    │
│                │     │             │  ml+claude   │    │
│                │     │             NO             │    │
│                │     │             │              │    │
│                │     │             ▼              │    │
│                │     │    ML scores only          │    │
│                │     │    (ml-semantic)            │    │
│                │     └──────────────────────────┘    │
│                │                                     │
│                ▼                                     │
│  ┌──────────────────────────────────────────┐       │
│  │ Tier 3: Keyword Fallback                  │       │
│  │                                           │       │
│  │ • Counts keyword matches per clause       │       │
│  │ • Score = matchRatio × 85 + bonus(>50%)   │       │
│  │ • Always available, no dependencies       │       │
│  │                                           │       │
│  │ Try Claude enhancement? ─┬── YES ──→      │       │
│  │                          │  claude-only    │       │
│  │                          NO               │       │
│  │                          │                │       │
│  │                          ▼                │       │
│  │                  keyword-fallback          │       │
│  └──────────────────────────────────────────┘       │
└────────────────────────────────────────────────────┘
```

## Scoring Methods

| Method | Tiers Used | Confidence | When |
|---|---|---|---|
| `ml+claude` | 1 + 2 | High | ML service running + API key configured |
| `ml-semantic` | 1 only | Medium-High | ML service running, no API key |
| `claude-only` | 3 + 2 | Medium-High | No ML service, API key configured |
| `keyword-fallback` | 3 only | Medium-Low | No ML service, no API key |

## Tier 1: ML Semantic Scoring

**Service**: Python microservice at `http://localhost:5001` (configurable via `ML_SERVICE_URL` env var)

**Technology**: sentence-transformers for semantic similarity computation

**Endpoint**: `POST /score-all`

**Request:**
```json
{
  "documentText": "First 8000 characters of the document...",
  "clauses": [
    {
      "id": "4.1",
      "title": "Understanding the organization and its context",
      "description": "The organization shall determine...",
      "guidance": "Organizations should consider...",
      "keywords": ["context", "stakeholder", "risk"]
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "clauseId": "4.1",
      "clauseTitle": "Understanding the organization...",
      "score": 72,
      "confidence": "high",
      "method": "semantic",
      "semanticSimilarity": 0.78,
      "keywordMatchRatio": 0.65
    }
  ],
  "aggregate": {
    "averageScore": 68,
    "totalClauses": 28
  }
}
```

**Health Check**: `GET /health` — returns 200 if service is operational. Used by `checkMLServiceHealth()`.

## Tier 2: Claude AI Enhancement

**Model**: Claude claude-sonnet-4-20250514 via Anthropic SDK

**Purpose**: Refine base scores (from ML or keyword) with contextual document understanding.

**Process**:
1. Takes base clause scores + document excerpt (first 4000 chars)
2. Asks Claude to refine each score based on actual document content
3. Returns adjusted scores (0-100) with specific, document-evidence-based findings
4. Merges enhanced scores with base scores (enhanced takes priority where available)

**Scoring enhancement**: Claude can adjust scores up or down from the base, and replaces generic findings with specific evidence-based findings from the document.

## Tier 3: Keyword Fallback

**Dependencies**: None — always available.

**Algorithm**:
1. For each clause, count how many of its `keywords` array entries appear in the document text (case-insensitive)
2. Compute `matchRatio = matchCount / totalKeywords`
3. Score = `matchRatio × 85 + (matchRatio > 0.5 ? 15 : 0)` (capped at 100)
4. Confidence = `matchRatio > 0.6 ? "medium" : "low"`

**Finding generation**: Uses score thresholds:
- ≥ 80: "Strong compliance with {clause}."
- ≥ 60: "Partial compliance with {clause}."
- ≥ 30: "Limited compliance with {clause}."
- < 30: "Non-compliant with {clause}."

## Maturity Level Mapping

All tiers use the same 5-level maturity scale:

| Score Range | Level | Label |
|---|---|---|
| 90-100 | 5 | Optimized |
| 75-89 | 4 | Managed |
| 60-74 | 3 | Defined |
| 40-59 | 2 | Developing |
| 0-39 | 1 | Initial |

## API

### `scoreStandard(documentText, standardCode, onLog?)`
Score all clauses of a single standard. Tries ML → Claude → Keyword in order.

### `scoreAllStandards(documentText, standardCodes, onLog?)`
Score multiple standards sequentially. Used by the orchestrator.

### `checkMLServiceHealth()`
Returns `true` if the ML microservice is reachable (5-second timeout).

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `ML_SERVICE_URL` | `http://localhost:5001` | URL of the Python ML scoring microservice |
| `ANTHROPIC_API_KEY` | (none) | Required for Tier 2 Claude enhancement |

## Code Reference

`server/src/services/HybridScoringService.ts`
