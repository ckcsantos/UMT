# Data Model

This document describes every data entity the application uses: the campaign draft accumulated during wizard steps, the campaign record returned by the API, and the audience filter structure.

> **Note:** There is currently no persistent database on the frontend side. All state lives in browser `sessionStorage` during a session. The backend (Quarkus) will own the authoritative data model — this document reflects the shapes the frontend expects and the API contract the backend must satisfy.

---

## Campaign Record (API)

Returned by `GET /api/campaigns` and `GET /api/campaigns/:id`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique campaign identifier |
| `name` | `string` | Yes | Campaign display name |
| `type` | `string` | Yes | Campaign type. Current value: `"Blast"`. Future: `"Top-up & Get"`, `"Register & Get"`, `"Spend & Get"`, `"Pull KW"` |
| `status` | `"active" \| "draft" \| "inactive"` | Yes | Current state. `"draft"` is displayed as "For Review" in the UI |
| `audience` | `number \| null` | No | Estimated subscriber count. `null` for draft campaigns |

---

## Campaign Draft (Frontend — CampaignContext)

Accumulated across the 5 wizard steps and persisted to `sessionStorage` under key `umt_campaign_draft`. Submitted as the body of `POST /api/campaigns`.

### `draft.details` — Step 1

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Campaign name |
| `description` | `string` | No | Free-text description (max 250 chars) |
| `type` | `string` | Yes | One of: `Blast`, `Top-up & Get`, `Register & Get`, `Spend & Get`, `Pull KW` |
| `squad` | `string` | Yes | Owning squad. One of: `Core Growth`, `Retention`, `Product`, `Operations` |

### `draft.audience` — Step 2

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brands` | `string[]` | Yes (min 1) | Selected brand. Single selection. Options: `TM`, `Globe Prepaid`, `Globe Postpaid`, `Globe at Home` |
| `estimatedCount` | `number \| null` | No | Subscriber count returned by `POST /api/audience/estimate` |
| `groups` | `FilterGroup[]` | No | Array of filter groups. Empty array means no filtering (all subscribers of selected brand) |

#### `FilterGroup`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Timestamp-based local identifier |
| `filters` | `Filter[]` | Filters within this group |
| `groupOperator` | `"AND" \| "OR"` | Logic operator between this group and the next (currently fixed to `AND` between groups) |

#### `Filter`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Timestamp-based local identifier |
| `field` | `string` | Attribute name. See Attribute Reference below |
| `operator` | `string` | Comparison operator. Depends on field data type — see Operator Reference |
| `value` | `string` | Selected value for the attribute |
| `filterOperator` | `"AND" \| "OR"` | Logic between this filter and the previous one in the same group |

#### Attribute Reference

| Attribute | Data Type | Valid Values |
|-----------|-----------|-------------|
| `Status` | categorical | `Active`, `Inactive`, `Suspended` |
| `SIM Type` | categorical | `Prepaid`, `Postpaid`, `Hybrid` |
| `Value Segment` | categorical | `High Value`, `Mid Value`, `Low Value` |
| `Region` | categorical | `NCR`, `Luzon`, `Visayas`, `Mindanao` |
| `Tenure (years)` | numeric | `< 1`, `1–3`, `3–5`, `> 5` |

#### Operator Reference

| Field Type | Available Operators |
|------------|-------------------|
| `categorical` | `equals`, `not equals` |
| `numeric` | `equals`, `not equals`, `greater than`, `less than`, `≥ at least`, `≤ at most` |

### `draft.message` — Step 3

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageType` | `string` | Yes | One of: `Invite`, `Promotional`, `Informational`, `Reminder`, `Follow-up` |
| `channel` | `string` | Yes | One of: `SMS`, `Email`, `Push Notification`, `In-App` |
| `body` | `string` | No | Auto-populated from template. Read-only; based on `messageType` + campaign name |

### `draft.schedule` — Step 4

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | `string` | Yes | Start date in `YYYY-MM-DD` format |
| `startTime` | `string` | Yes | Start time in `HH:MM` 24-hour format |
| `recurrence` | `string` | Yes | One of: `none`, `daily`, `weekly`, `monthly`, `yearly`, `weekdays`, `custom` |
| `weekDays` | `number[]` | For weekly | Day-of-week indices (0=Sun, 1=Mon, …, 6=Sat) |
| `endsType` | `string` | For recurring | One of: `never`, `on`, `after` |
| `endsDate` | `string` | If `endsType=on` | End date in `YYYY-MM-DD` |
| `endsAfter` | `number` | If `endsType=after` | Number of occurrences |
| `customInterval` | `number` | If `recurrence=custom` | Repeat interval, e.g. `2` for "every 2 weeks" |
| `customUnit` | `string` | If `recurrence=custom` | One of: `day`, `week`, `month`, `year` |
| `frequency` | `string` | — | Legacy compat: `Once`, `Daily`, `Weekly`, `Monthly` |
| `time` | `string` | — | Alias for `startTime` |
| `days` | `number[]` | — | Alias for `weekDays` |

---

## Auth Session

Stored in `sessionStorage` under key `umt_auth`.

| Field | Type | Description |
|-------|------|-------------|
| `authenticated` | `boolean` | Always `true` when present |
| `email` | `string` | Logged-in user's username/email |

---

## POST /api/campaigns — Full Request Body

The complete draft is sent as-is:

```json
{
  "details": {
    "name": "Campaign Name",
    "description": "Optional description",
    "type": "Blast",
    "squad": "Core Growth"
  },
  "audience": {
    "brands": ["Globe Prepaid"],
    "estimatedCount": 75000,
    "groups": [
      {
        "id": 1717000000000,
        "filters": [
          {
            "id": 1717000000001,
            "field": "Region",
            "operator": "equals",
            "value": "NCR",
            "filterOperator": "AND"
          }
        ],
        "groupOperator": "OR"
      }
    ]
  },
  "message": {
    "messageType": "Promotional",
    "channel": "SMS",
    "body": "[First Name], don't miss out! ..."
  },
  "schedule": {
    "date": "2026-06-10",
    "startTime": "09:00",
    "recurrence": "weekly",
    "weekDays": [1, 3],
    "endsType": "after",
    "endsAfter": 12,
    "customInterval": 1,
    "customUnit": "week"
  }
}
```
