# ARROW X — Campaign Studio

**ARROW X** (Campaign Studio) is an internal web application for Globe Telecom marketing and operations teams to create, configure, and submit SMS/messaging campaigns to subscribers. It provides a guided, multi-step wizard that walks users through defining a campaign, selecting a target audience, authoring a message, and scheduling delivery.

---

## Who It's For

| Role | How they use it |
|------|----------------|
| Campaign Manager | Creates and submits campaigns end-to-end |
| Squad Lead | Reviews campaign configuration before approval |
| Marketing Ops | Monitors campaign status on the Dashboard |
| Backend Developer | Implements the Quarkus API that connects to Snowflake, Aerospike, and the messaging platform |

---

## Key Features

- **Dashboard** — At-a-glance view of total campaigns, active count, and campaigns pending review. Status breakdown bar and filterable campaign table.
- **5-Step Campaign Wizard** — A linear, validated flow: Details → Audience → Message → Schedule → Review.
- **Audience Builder** — Brand selector (single selection), dynamic filter groups with AND/OR logic, field glossary tooltips, searchable dropdowns, and a real-time audience count button.
- **Message Composer** — Predefined templates auto-populated per message type, multi-channel support (SMS, Email, Push, In-App), SMS character counter.
- **Scheduler** — Google Calendar–style date/time picker, 15-minute increment time slots, full recurrence rules (daily, weekly, monthly, yearly, weekday, custom), and configurable end conditions.
- **Review & Submit** — Full summary of all steps with inline edit links, submits campaign for review.
- **Save for Later** — Any step can be saved mid-flow and resumed later from the Dashboard.

---

## How It Works (High Level)

```
Browser (React SPA)
  │
  ├─ AuthContext     → manages login session (sessionStorage)
  ├─ CampaignContext → accumulates draft data across all 5 steps (sessionStorage)
  ├─ api.js          → all HTTP calls go through one central client
  │
  ↓  fetch('/api/...')
  │
  [DEV]  MSW Service Worker intercepts → returns mock data (no server needed)
  [PROD] Quarkus API (to be implemented) → Snowflake, Aerospike, messaging platform
```

In development, no backend is required — **MSW (Mock Service Worker)** runs entirely in the browser and intercepts all API calls, returning realistic mock data. When the Quarkus backend is ready, switching is seamless: update `VITE_API_URL` in the environment and remove the MSW dev flag.

---

## Repository Layout

```
UMT/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Shared UI components (Layout, Sidebar, StepBar, SearchableSelect)
│   │   ├── contexts/       # AuthContext, CampaignContext
│   │   ├── mocks/          # MSW handlers and browser worker (dev only)
│   │   ├── pages/          # One file per route/screen
│   │   ├── services/       # api.js — central API client
│   │   └── styles/         # global.css — all app styles
│   ├── public/             # mockServiceWorker.js (MSW)
│   ├── .env.example        # Environment variable reference
│   └── vite.config.js      # Vite config + dev proxy to FastAPI
│
├── src/
│   └── umt.py              # FastAPI stub server (legacy dev server, being replaced by Quarkus)
│
├── tests/
│   └── test_umt.py         # API integration tests
│
└── docs/                   # This documentation
```
