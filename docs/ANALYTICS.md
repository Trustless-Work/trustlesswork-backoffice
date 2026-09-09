# Analytics API — August 2026 update (backoffice integration guide)

Audience: the backoffice dashboard and the AI assisting its implementation.
Scope: the changes shipped on 2026-08-26 to the `/analytics/*` surface of the
Trustless Work Core API. Everything here is **additive — nothing you already
integrated breaks.** The live Swagger at `/docs` (JSON at `/api`) is the
contract of truth; this document explains the semantics Swagger cannot.

## TL;DR — what changed

1. **New endpoint** `GET /analytics/revenue/events`: the transactional revenue
   table (one row per revenue-bearing escrow) with real timestamps
   (`createdAt`), standard `limit`/`offset` pagination, and `from`/`to`/
   `eventType` filters. This is the data source for the "revenue ledger" table
   in the dashboard.
2. **Sub-month ranges** on the three series endpoints
   (`/analytics/escrows/monthly`, `/analytics/users/monthly`,
   `/analytics/revenue/monthly`): new `granularity=day|week|month` and
   `periods=N` query params. `?months=` still works exactly as before.
3. **Bucket key renamed**: series buckets now carry `period` as the canonical
   key. `month` is still present with the same value (deprecated alias) so
   existing code keeps working — migrate to `period` when convenient.

Unchanged: `GET /analytics/escrows/status`, `GET /analytics/data-quality`,
auth, error shapes.

## Auth (unchanged)

Every `/analytics/*` endpoint requires the `x-api-key` header with a key whose
role includes `BACKOFFICE_ADMIN`.

- Missing/invalid key → `401`.
- Valid key without the role → `403`.

## 1. Series endpoints: `granularity` + `periods`

Applies identically to:

- `GET /analytics/escrows/monthly` — escrows created (chain clock)
- `GET /analytics/users/monthly` — user signups
- `GET /analytics/revenue/monthly` — fee revenue per token

(The `/monthly` path names predate the feature and were kept for
compatibility; with `granularity=day` they serve daily buckets.)

### Query parameters

| Param         | Type                       | Default                        | Notes                                                                                                                                                                             |
| ------------- | -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `granularity` | `day` \| `week` \| `month` | `month`                        | Bucket size. All buckets are **UTC**. Weeks start on **Monday**.                                                                                                                  |
| `periods`     | int ≥ 1                    | month: 12 · week: 12 · day: 30 | How many buckets, ending at the **current** UTC bucket. Caps: month ≤ 36, week ≤ 156, day ≤ 366. Over the cap → `400`.                                                            |
| `months`      | int 1–36                   | —                              | **Deprecated** alias of `periods`. Only meaningful with the default `month` granularity; ignored when `periods` is present. Keep using it only in code you have not migrated yet. |

### Range-picker mapping

| Dashboard range | Query                                                    |
| --------------- | -------------------------------------------------------- |
| Last 12 months  | `?granularity=month&periods=12` (or legacy `?months=12`) |
| Last month      | `?granularity=day&periods=30`                            |
| Last week       | `?granularity=day&periods=7`                             |
| Last 3 days     | `?granularity=day&periods=3`                             |
| Last day        | `?granularity=day&periods=1`                             |
| Weekly trend    | `?granularity=week&periods=12`                           |

### Response shape (what changed)

Every series point now looks like:

```json
{ "period": "2026-08-26", "month": "2026-08-26", "count": 6, "growthPct": null }
```

- `period` — canonical bucket key. Format depends on granularity:
  `YYYY-MM` for `month`, `YYYY-MM-DD` (the bucket **start**) for `week` and
  `day`. A week key is always a Monday.
- `month` — deprecated mirror of `period` (same value, always present).
  **Use `period` in new code.**
- The series is always **dense**: empty buckets are returned as `0`, never
  skipped. Charts must render the gaps.
- `growthPct` — percent change vs the **previous bucket** (was
  month-over-month; now it follows the granularity), one decimal. `null` on
  the first bucket and whenever the previous bucket is `0`.
- The top level now includes `granularity` echoing what was applied, e.g.
  `{ "network": "testnet", "granularity": "day", "data": [...] }`.
  `/revenue/monthly` also keeps `feeBps`.

`GET /analytics/revenue/monthly` buckets are unchanged apart from
`period`/`month`: one bucket per (period × token × category), amounts as exact
decimal strings in human units of the token.

## 2. New: `GET /analytics/revenue/events` — the revenue ledger

One row per **revenue-bearing escrow** (an escrow with released funds),
newest first. This endpoint powers the transactional table: escrow, type,
date/time, organization, amount, fee, asset.

### Query parameters

| Param       | Type                           | Default | Notes                                 |
| ----------- | ------------------------------ | ------- | ------------------------------------- |
| `limit`     | int 1–200                      | 50      | Page size.                            |
| `offset`    | int ≥ 0                        | 0       | Rows skipped before this page.        |
| `from`      | ISO 8601 datetime              | —       | Inclusive lower bound on `createdAt`. |
| `to`        | ISO 8601 datetime              | —       | Inclusive upper bound on `createdAt`. |
| `eventType` | `release` \| `resolve_dispute` | —       | Omit for both.                        |

Invalid values (bad date, unknown `eventType`, `limit` > 200) → `400`.

### Response

```json
{
  "network": "testnet",
  "feeBps": 30,
  "data": [
    {
      "escrowId": "CBZXBSOQH3EWJHY5JE65QW6ZFJYLXKUAYNGG3PEGNSHHRFVVBLOF3FSQ",
      "engagementId": "ENG-2026-041",
      "eventType": "release",
      "createdAt": "2026-06-09T23:33:46.000Z",
      "txHash": "44a4a684cd8dbec745ca1d29855edd2f7eada7ff07e06b831c31102268b6a633",
      "organization": { "id": "12", "name": "Acme Marketplace" },
      "asset": {
        "address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
        "symbol": "USDC",
        "decimals": 7,
        "resolved": true
      },
      "amount": "263.5",
      "feeAmount": "0.7905"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 41 }
}
```

Field semantics — read these before building the table:

- `escrowId` — the escrow **contract id** (`C…`), the public identifier used
  across the rest of the API.
- `engagementId` — the platform's own reference recorded on the escrow;
  nullable.
- `eventType` — `release` = released with no dispute in its history;
  `resolve_dispute` = the escrow's event history contains a dispute
  resolution. The two sets are **disjoint** (a row is one or the other), so
  totals per type can be added safely.
- `createdAt` — **business time from the blockchain** (the ledger close time
  of the escrow's last release event), NOT the time our database ingested it.
  ISO 8601 UTC. Sort order of the ledger is `createdAt` descending.
- `txHash` — transaction hash of the attributing release event; nullable for
  escrows released before event indexing existed.
- `organization` — the platform this escrow is attributed to
  (`{ id, name }`). `id` is a **string** (64-bit ids do not fit safely in a
  JS number). **`null` is common and expected**: escrows deployed outside our
  API, or whose attribution never matched, are still revenue — render them as
  "Unattributed", do not drop them.
- `asset` — the escrow's trustline token. `decimals` is what `amount` and
  `feeAmount` were scaled with. **If `resolved` is `false`**, decimals
  defaulted to 7 because the token metadata is not resolved yet — flag those
  amounts in the UI rather than trusting the magnitude.
- `amount` — the escrow's **whole accumulated released value**, human units,
  exact decimal string (parse with a decimal library or display as-is; never
  `parseFloat` for arithmetic you will re-aggregate).
- `feeAmount` — Trustless Work revenue for the row: `feeBps`/10000 (0.3%) of
  `amount`, floored at base-unit precision. Derived — the fee is not stored
  on-chain.
- `pagination.total` — total matching rows across all pages (already honors
  `from`/`to`/`eventType`), correct even when `offset` is past the last page.

### Two invariants your implementation can rely on

1. **The ledger reconciles exactly with the series.** Summing `feeAmount`
   (or `amount`) per token over any date range equals the
   `/analytics/revenue/monthly` buckets covering that range. Same population,
   same attribution rule. If your table totals and your chart disagree, it is
   a client-side bug, not a data race.
2. **One row per escrow, not per on-chain event.** The blockchain does not
   include the amount in release events, so a multi-release escrow cannot be
   split into exact per-milestone rows. Its whole accumulated release appears
   as one row dated at its **last** release. This is a documented
   approximation shared by the series and the ledger — do not present the
   `createdAt` of a multi-release escrow as "the date all of it was paid".

### Rules that prevent wrong dashboards

- **Never add `amount`/`feeAmount` across different tokens.** Different
  currencies AND different scales. One total per token; a cross-token total
  requires your own FX rates.
- Amounts are **strings** on purpose (arbitrary precision). Keep them as
  strings or use a decimal type.
- All timestamps and buckets are **UTC**. Do not convert bucket keys to local
  time or rows will visually shift a day.

## 3. Data honesty — render this next to the charts

`GET /analytics/data-quality` (unchanged) exists so the dashboard can say how
complete the other numbers are. Recommended: a small banner/tooltip fed by it.

- `unbackfilledReleased` > 0 means that many released escrows are **excluded**
  from both the revenue series and the ledger (their financial columns predate
  a backfill). Heads-up: a production backfill is planned — when it runs,
  historical revenue numbers will **increase**. Showing this counter next to
  the revenue chart explains that shift to users.
- `openGaps` > 0 means ledger ranges with no data at all — any chart
  overlapping a gap understates.

## 4. Migration checklist for existing dashboard code

1. Nothing breaks today: `?months=12` and the `month` field keep working.
2. Switch reads from `month` → `period` in series points (same value today).
3. Wire the range picker to `granularity` + `periods` (mapping table above).
4. Build the transactional table on `GET /analytics/revenue/events`
   (`limit`/`offset` pagination, `from`/`to` from the date picker,
   `eventType` from a type filter).
5. Handle `organization: null` as "Unattributed" and `asset.resolved: false`
   as "amount scale unverified".
6. Add the data-quality banner (section 3).

## Errors (unchanged shapes)

- `400` — validation, body like
  `{ "statusCode": 400, "message": ["periods must not be greater than 366 for granularity=day"], "error": "Bad Request" }`.
- `401` — missing/invalid `x-api-key`.
- `403` — key lacks `BACKOFFICE_ADMIN`.

## Coming next (not shipped yet — do not code against these)

Per the "Analytics | Version 2" plan: KPI aggregates (MTD/YTD/all-time,
average ticket, GMV vs fee series, revenue growth %), revenue by
organization, revenue by amount bucket, and operational health (stuck
milestones, created→released conversion). Field names above will not change.
