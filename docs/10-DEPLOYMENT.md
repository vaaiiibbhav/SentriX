# Deployment Guide

## Overview

SentriX uses a monorepo structure with separate `client/` and `server/` directories. The frontend is a Vite + React application and the backend is an Express + TypeScript API server. An optional Python microservice provides ML-based scoring.

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18+ | Runtime for both client and server |
| **npm** | 9+ | Package management |
| **Python** | 3.9+ (optional) | ML scoring microservice |
| **Groq API key** | — | Required for AI-powered assessments |

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd SentriX

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required — Groq Cloud API key for AI agent execution
GROQ_API_KEY=gsk_your-groq-api-key-here

# Optional — OmniAgent orchestration (falls back to local generation when unset)
GENW_API_BASE_URL=https://genw.example.com
GENW_API_KEY=genw_your_api_key_here
GENW_TIMEOUT_MS=45000
GENW_HEALTH_ENDPOINT=/health

# Server configuration
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Variable reference:**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | API key for Groq Cloud (model: `openai/gpt-oss-120b`) |
| `GENW_API_BASE_URL` | No | — | OmniAgent platform endpoint |
| `GENW_API_KEY` | No | — | OmniAgent authentication key |
| `GENW_TIMEOUT_MS` | No | `45000` | Timeout for GenW API calls (ms) |
| `GENW_HEALTH_ENDPOINT` | No | `/health` | OmniAgent health check path |
| `PORT` | No | `3001` | Express server port |
| `CLIENT_URL` | No | `http://localhost:5173` | CORS allowed origin |

### 3. Start the Server

```bash
cd server
npm run dev
```

This runs `tsx watch src/index.ts` — the server starts on port 3001 with hot-reload.

Expected output:
```
🚀 SentriX Server running on port 3001
📊 Assessment routes: /api/assessment/*
💬 Chat routes: /api/chat/*
📋 Standards routes: /api/standards/*
📁 Upload routes: /api/upload/*
📄 Report routes: /api/report/*
📜 Policy routes: /api/policy/*
🎯 Demo routes: /api/demo/*
🧬 GenW routes: /api/genw/*
```

### 4. Start the Client

```bash
cd client
npm run dev
```

This runs Vite dev server on port 5173 with HMR (Hot Module Replacement).

The Vite dev server proxies all `/api` requests to `http://localhost:3001`, so no additional proxy configuration is needed.

### 5. Optional: Start Python ML Service

```bash
cd server
pip install flask flask-cors sentence-transformers numpy
python src/services/scoringService.py
```

The ML service starts on port 5001 and provides Tier 1 semantic scoring. If unavailable, the scoring engine falls back to Tier 2 (Groq) or Tier 3 (local keyword + NLP).

---

## NPM Scripts

### Server (`server/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/index.ts` | Development server with hot-reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/index.js` | Run compiled production server |

### Client (`client/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development server with HMR |
| `build` | `tsc -b && vite build` | Type-check and build for production |
| `lint` | `eslint .` | Run ESLint |
| `preview` | `vite preview` | Preview production build locally |

---

## Production Build

### Build the Client

```bash
cd client
npm run build
```

This runs TypeScript type-checking (`tsc -b`) followed by Vite's production build. The output is written to `client/dist/`.

### Build the Server

```bash
cd server
npm run build
```

This compiles TypeScript to JavaScript in the `server/dist/` directory.

### Run in Production

```bash
cd server
npm start
```

This runs `node dist/index.js`. The server serves the API endpoints. The built client static files should be served by a reverse proxy (nginx, Caddy) or a static hosting service.

---

## Deployment Architecture

### Recommended Production Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Reverse Proxy                      │
│              (nginx / Caddy / ALB)                   │
│                                                      │
│   HTTPS termination, static file serving, routing    │
├──────────────────┬──────────────────────────────────┤
│                  │                                    │
│   Static Files   │   API Requests (/api/*)            │
│   (client/dist/) │                                    │
│                  ▼                                    │
│          ┌───────────────┐                           │
│          │  Express API   │                           │
│          │  (port 3001)   │                           │
│          └───────┬───────┘                           │
│                  │                                    │
│          ┌───────┴───────┐                           │
│          │  Python ML     │                           │
│          │  (port 5001)   │                           │
│          └───────────────┘                           │
└─────────────────────────────────────────────────────┘
                   │
         External Services
    ┌──────────────┼──────────────┐
    │              │              │
Groq Cloud    OmniAgent       (Future DB)
```

### Docker Deployment (Example)

```dockerfile
# Server Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

```dockerfile
# Client Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Environment-Specific Configuration

| Environment | `CLIENT_URL` | Server | Notes |
|-------------|-------------|--------|-------|
| Development | `http://localhost:5173` | `localhost:3001` | Vite proxy handles API routing |
| Staging | `https://staging.SentriX.app` | Internal port | Behind reverse proxy with HTTPS |
| Production | `https://SentriX.app` | Internal port | Behind reverse proxy with HTTPS |

---

## Health Checks

### Server Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-09T10:00:00.000Z"
}
```

### ML Service Health

```bash
curl http://localhost:5001/health
```

Or via the API:

```bash
curl http://localhost:3001/api/standards/health/ml
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| `GROQ_API_KEY is not set` | Missing `.env` configuration | Create `.env` file from `.env.example` |
| Port 3001 in use | Another process on port 3001 | Change `PORT` in `.env` or kill the process |
| Upload fails with 413 | File exceeds 20 MB limit | Reduce file size or split into multiple files |
| ML scoring unavailable | Python service not running | Start `scoringService.py` or rely on Tier 2/3 fallback |
| CORS errors | `CLIENT_URL` mismatch | Ensure `CLIENT_URL` in `.env` matches the frontend origin |
| Vite proxy errors | Server not running | Start the server before the client in development |

### Verifying the Pipeline

1. Start both server and client
2. Navigate to `http://localhost:5173`
3. Click "Run Demo Assessment" on the dashboard (or use `GET /api/demo/assessment`)
4. Verify agents execute and scores are displayed
