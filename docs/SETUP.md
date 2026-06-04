# Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend dev server and build |
| npm | 9+ | Package management |
| Python | 3.10+ | FastAPI stub server (optional — only needed for backend contract testing) |
| Git | Any | Source control |

> The frontend runs entirely on its own with MSW mocks. You **do not** need Python or any backend to run the UI.

---

## Quick Start (Frontend only)

```bash
# 1. Clone the repo
git clone <repo-url>
cd UMT/frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.  
Log in with: `admin` / `admin`

MSW starts automatically in dev mode — all API calls are intercepted and return mock data. No backend needed.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in as needed:

```bash
cp .env.example .env
```

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Base URL for the backend API. Leave empty to use the Vite dev proxy (recommended for local dev). Set to the Quarkus server origin in staging/prod. | `""` (empty) |

**Example for production:**
```
VITE_API_URL=https://api.arrowx.internal
```

> Never commit real values. The `.env` file is gitignored.

---

## Running the FastAPI Stub (Optional)

The FastAPI server (`src/umt.py`) is a legacy stub kept for backend contract testing. It is **not** used in normal frontend development.

```bash
# From the project root
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install fastapi uvicorn starlette

# Start the API server
python -m umt
# → http://127.0.0.1:8000
```

With both servers running, the Vite dev proxy forwards `/api/*` requests to FastAPI (port 8000) instead of MSW.

> **To disable MSW and use the real FastAPI:** Set `VITE_USE_MOCK=false` in your `.env` — or simply don't set it, since MSW only starts when `import.meta.env.DEV` is `true` and `main.jsx` imports the mock. For a clean toggle, you can comment out the MSW block in `frontend/src/main.jsx`.

---

## Running Tests

```bash
# From the project root (requires Python + dependencies installed)
source .venv/bin/activate
pytest tests/
```

Tests cover the FastAPI stub routes. They use a fresh `TestClient` per test to avoid session bleed.

---

## Project Build

```bash
cd frontend
npm run build
```

Output goes to `UMT/build/`. The FastAPI `spa_catch_all` route serves `index.html` from this directory, enabling the SPA catch-all for production.

**Build output structure:**
```
build/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

## Connecting to Quarkus (When Ready)

No code changes are needed. Just:

1. Set `VITE_API_URL` to the Quarkus server URL in your `.env` (or deployment environment):
   ```
   VITE_API_URL=https://api.arrowx.internal
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

MSW is excluded from production builds automatically (`import.meta.env.DEV` is `false`). All API calls will go directly to Quarkus.

---

## Git Remotes

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | GitHub | Primary remote (auto-pushed on commit) |
| `gogs` | `https://gogs-cicd.steps-dev-apps.edo.globe.com.ph/JVL/UMT.git` | Internal Globe Gogs instance |

Push to Gogs (requires VPN / Globe internal network):
```bash
GIT_SSL_NO_VERIFY=true git push gogs main:master
```

---

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `Failed to load campaigns: Unauthorized` after hot reload | MSW resets its in-memory `sessionUser` on HMR but `sessionStorage` still has auth | Refresh the page — `AuthContext` will re-check the session |
| Gogs push fails with SSL error | Not connected to Globe internal network | Connect to VPN first |
| `Cannot find module 'msw'` | MSW not installed | Run `npm install` in `frontend/` |
| Port 5173 already in use | Another Vite instance running | Kill it: `lsof -ti:5173 \| xargs kill` |
| Port 8000 already in use | Another FastAPI instance running | Kill it: `lsof -ti:8000 \| xargs kill` |
