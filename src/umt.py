import uvicorn
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI(title="UMT")
app.add_middleware(SessionMiddleware, secret_key="umt-dev-secret-change-in-production")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CREDENTIALS = {"admin@globe.com.ph": "admin", "admin": "admin"}

CAMPAIGNS = [
    {"id": 1, "name": "Campaign 1 — Educational", "type": "Blast", "status": "active",   "audience": 60000},
    {"id": 2, "name": "Campaign 2 — Informative", "type": "Blast", "status": "draft",    "audience": None},
    {"id": 3, "name": "Campaign 3 — Follow-up",   "type": "Blast", "status": "active",   "audience": 45000},
    {"id": 4, "name": "Campaign 4 — Retention",   "type": "Blast", "status": "inactive", "audience": 48000},
    {"id": 5, "name": "Campaign 5 — Growth",      "type": "Blast", "status": "active",   "audience": 72000},
    {"id": 6, "name": "Campaign 6 — Planning",    "type": "Blast", "status": "draft",    "audience": None},
]


# ── API routes ──────────────────────────────────────────────────────────────

@app.get("/api/me")
async def api_me(request: Request):
    user = request.session.get("user")
    if user:
        return {"authenticated": True, "email": user}
    return {"authenticated": False}


@app.post("/api/login")
async def api_login(request: Request):
    body = await request.json()
    email = body.get("email", "")
    password = body.get("password", "")
    if CREDENTIALS.get(email) == password:
        request.session["user"] = email
        return {"ok": True, "email": email}
    return JSONResponse({"ok": False, "error": "Invalid credentials"}, status_code=401)


@app.post("/api/logout")
async def api_logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get("/api/campaigns")
async def api_campaigns(request: Request):
    if not request.session.get("user"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    return {"campaigns": CAMPAIGNS}


@app.get("/api/campaigns/{campaign_id}")
async def api_get_campaign(campaign_id: int, request: Request):
    if not request.session.get("user"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    # TODO: fetch single campaign record from database
    campaign = next((c for c in CAMPAIGNS if c["id"] == campaign_id), None)
    if not campaign:
        return JSONResponse({"error": "Not found"}, status_code=404)
    return {"campaign": campaign}


@app.post("/api/campaigns")
async def api_create_campaign(request: Request):
    if not request.session.get("user"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    body = await request.json()
    # TODO: validate payload, persist to database, enqueue for execution
    # Expected payload shape:
    #   {
    #     "details":  { name, type, squad, description },
    #     "audience": { brands, groups, estimatedCount },
    #     "message":  { messageType, channel, body },
    #     "schedule": { frequency, date, time, days }
    #   }
    # Returns the created campaign record including its assigned id and status.
    return JSONResponse({"ok": True, "id": None, "status": "queued"}, status_code=201)


@app.post("/api/audience/estimate")
async def api_audience_estimate(request: Request):
    if not request.session.get("user"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    body = await request.json()
    # TODO: query Snowflake subscriber base filtered by brands and groups
    # Expected payload shape:
    #   {
    #     "brands": ["GlobeOne", "TM", ...],
    #     "groups": [
    #       { "filters": [{ "field", "operator", "value", "filterOperator" }], "groupOperator": "OR" }
    #     ]
    #   }
    # Returns the estimated subscriber count matching those filters.
    return {"count": 0, "note": "stub — Snowflake query not yet implemented"}


# ── SPA static file serving (production build) ──────────────────────────────

BUILD_DIR = Path(__file__).parent.parent / "build"

if BUILD_DIR.exists():
    app.mount("/assets", StaticFiles(directory=BUILD_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def spa_catch_all(full_path: str):
        index = BUILD_DIR / "index.html"
        return FileResponse(index)


def main() -> None:
    print("Starting UMT API on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)


if __name__ == "__main__":
    main()
