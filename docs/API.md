# API Reference

All endpoints are under the `/api` prefix. In development, Vite proxies `/api/*` requests to `http://127.0.0.1:8000`. In production, `VITE_API_URL` should be set to the Quarkus server origin.

**Base URL (dev):** `http://localhost:5173` (proxied)  
**Base URL (prod):** value of `VITE_API_URL`

**Auth mechanism:** Cookie-based session (FastAPI stub) / to be defined by Quarkus team.  
**Content-Type:** `application/json` for all requests with a body.

---

## Auth Endpoints

### `GET /api/me`

Check if the current session is authenticated.

**Auth required:** No  
**Request body:** None

**Response (authenticated):**
```json
{ "authenticated": true, "email": "admin" }
```

**Response (unauthenticated):**
```json
{ "authenticated": false }
```

---

### `POST /api/login`

Authenticate a user.

**Auth required:** No

**Request body:**
```json
{ "email": "admin", "password": "admin" }
```

**Response (success — 200):**
```json
{ "ok": true, "email": "admin" }
```

**Response (failure — 401):**
```json
{ "ok": false, "error": "Invalid credentials" }
```

---

### `POST /api/logout`

End the current session.

**Auth required:** No  
**Request body:** None

**Response (200):**
```json
{ "ok": true }
```

---

## Campaign Endpoints

### `GET /api/campaigns`

Fetch all campaigns.

**Auth required:** Yes (FastAPI stub gates this; MSW mock does not)  
**Request body:** None

**Response (200):**
```json
{
  "campaigns": [
    { "id": 1, "name": "Campaign 1 — Educational", "type": "Blast", "status": "active", "audience": 60000 },
    { "id": 2, "name": "Campaign 2 — Informative", "type": "Blast", "status": "draft",  "audience": null  }
  ]
}
```

---

### `GET /api/campaigns/:id`

Fetch a single campaign by ID.

**Auth required:** Yes  
**Request body:** None

**Response (200):**
```json
{ "campaign": { "id": 1, "name": "...", "type": "Blast", "status": "active", "audience": 60000 } }
```

**Response (404):**
```json
{ "error": "Not found" }
```

---

### `POST /api/campaigns`

Create and submit a new campaign. Called from the Review step.

**Auth required:** Yes

**Request body:** Full campaign draft object (see DATA_MODEL.md for complete shape):
```json
{
  "details":  { "name": "string", "description": "string", "type": "string", "squad": "string" },
  "audience": { "brands": ["string"], "groups": [...], "estimatedCount": 0 },
  "message":  { "messageType": "string", "channel": "string", "body": "string" },
  "schedule": { "date": "YYYY-MM-DD", "startTime": "HH:MM", "recurrence": "string", ... }
}
```

**Response (201):**
```json
{ "ok": true, "id": 7, "status": "queued" }
```

> **TODO (Quarkus team):** Validate payload, persist to database, enqueue to messaging platform. Return the assigned campaign `id`.

---

### `PATCH /api/campaigns/:id`

Update an existing campaign's fields.

**Auth required:** Yes

**Request body:** Partial campaign fields to update:
```json
{ "status": "active" }
```

**Response (200):**
```json
{ "ok": true }
```

> **TODO (Quarkus team):** Implement persistence.

---

## Audience Endpoint

### `POST /api/audience/estimate`

Estimate the number of subscribers matching the given brand and filter criteria. Called from the Audience Builder step when the user clicks "Count Audience."

**Auth required:** Yes

**Request body:**
```json
{
  "brands": ["Globe Prepaid"],
  "groups": [
    {
      "filters": [
        {
          "field": "Region",
          "operator": "equals",
          "value": "NCR",
          "filterOperator": "AND"
        }
      ],
      "groupOperator": "OR"
    }
  ]
}
```

**Response (200):**
```json
{ "count": 75000 }
```

> **TODO (Quarkus team):** Query Snowflake/Aerospike with the provided brands and filter groups to return a real subscriber count. Currently returns `0` (stub).

---

## Error Format

All error responses follow this shape:

```json
{ "error": "Human-readable message" }
```

HTTP status codes used:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthorized / invalid credentials |
| 404 | Resource not found |
| 500 | Server error |

---

## Dev vs Prod Behaviour

| | Development | Production |
|---|---|---|
| API handler | MSW (browser) | Quarkus server |
| Auth gating on data endpoints | None (MSW bypasses) | Enforced by Quarkus |
| `/api/audience/estimate` response | Formula-computed count | Real Snowflake query |
| `/api/campaigns` POST | Appends to in-memory array | Persists to database |
