# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # production build
```

**No backend required.** All API calls are handled by `frontend/src/services/api.js` using hardcoded local data — the FastAPI backend does not need to run.

### Backend (FastAPI) — not needed for frontend dev
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python -m uvicorn umt:app --app-dir src --host 127.0.0.1 --port 8000 --reload
```

### Tests
```bash
source .venv/bin/activate
pytest tests/
```

## Architecture

**Frontend-only dev setup:** Vite SPA (`frontend/`) on `:5173`. The FastAPI backend (`src/umt.py`) exists but is not needed — the frontend runs standalone.

**Hardcoded API layer:** `frontend/src/services/api.js` stubs all backend calls with local data and a small artificial delay so loading states behave naturally. To wire up a real backend, replace the implementations in that file.

**Auth flow:** `AuthContext` (`frontend/src/contexts/AuthContext.jsx`) calls `api.me()` on mount to restore session. The hardcoded implementation always returns an authenticated user, so the app loads directly into the dashboard. Login accepts the hardcoded credentials below.

**Campaign wizard state:** All 5 wizard steps share state through `CampaignContext` (`frontend/src/contexts/CampaignContext.jsx`), held in React memory only — no persistence. Draft is reset on launch or page refresh. Steps: Details → Audience Builder → Message → Schedule → Review.

**Hardcoded campaigns:** `getCampaigns()` returns 6 seed campaigns. `createCampaign()` resolves successfully but does not persist — newly submitted campaigns do not appear in the list until the hardcoded data is updated.

**Legacy templates:** The `templates/` directory contains Jinja2 HTML files from an earlier server-rendered version. They are not used — the React SPA is the active frontend.

## Migration Context

This repo is a design prototype. Changes here are periodically migrated to the Quarkus + React repo (`umt-backend/` + `umt-frontend/`). Keeping the frontend free of backend calls makes diffing and porting changes straightforward — only `frontend/src/` needs to be compared.

## Key Domain Concepts

- **Brands:** GlobeOne, TM, Globe Prepaid, Globe Postpaid, Globe at Home (used in audience targeting)
- **Campaign types:** Blast, Top-up & Get, Register & Get, Spend & Get, Pull KW
- **Squads:** Core Growth, Retention, Product, Operations
- **Channels:** SMS (160-char limit enforced), Email, Push Notification, In-App
- **Audience filters:** AND/OR group logic across Status, SIM Type, Value Segment, Region, Tenure — estimated count is a formula (`brands × 15000 + filters × 3000`), not a real query

## Hardcoded Credentials (dev only)
- `admin@globe.com.ph` / `admin`
- `admin` / `admin`
