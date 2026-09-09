# Analytics V2 — Integration Reference (AI-oriented)

> Audience: the engineer (or AI assistant) integrating the Trustless Work Core API
> analytics endpoints into the backoffice dashboard. Everything described here is
> **deployed to production** as of 2026-09-08. The machine-readable source of truth
> is Swagger (`/docs`, JSON at `/api`) — if this document and Swagger ever disagree,
> Swagger wins.

## 0. Ground rules (read first — these prevent every classic mistake)

1. **Auth**: every endpoint below requires header `x-api-key: <id>.<secret>` with a
   `BACKOFFICE_ADMIN` key. 401 = bad credential, 403 = wrong role.
2. **All money amounts are decimal STRINGS in human units** of their asset
   (e.g. `"263.5"`), already scaled by the token's decimals. Parse with a decimal
   library, never `parseFloat`, if you re-aggregate.
3. **NEVER add amounts across different assets.** Different tokens are different
   currencies AND different scales. Every payload groups amounts per `asset` object;
   render per-asset or apply your own FX rate.
4. **`asset.resolved: false` means decimals defaulted to 7** because token metadata
   is not resolved. Magnitudes for such assets may be wrong by orders of magnitude —
   badge them in the UI.
5. **The read model is eventually consistent** (~seconds behind chain). Render
   `GET /analytics/data-quality` next to the charts; each counter is a way the other
   numbers can silently understate.
6. **Fees are derived, never stored**: `feeAmount = feeBps/10000 × released value`,
   floored. Every response carries `feeBps` (currently `30` = 0.3%).
7. Timestamps named as chain clocks are **business time** (ledger close), not
   ingestion time.

---

## 1. BREAKING CHANGES to `GET /analytics/revenue/events`

The ledger changed shape in place (no versioning — internal admin API). Update your
client before anything else.

### 1.1 One row per on-chain EVENT (was: one row per escrow)

Each row now represents a single `tw_release` or `tw_disp_resolve` contract event
and carries **its own** `txHash`, its own chain-clock `createdAt`, and an honest
`eventType`:

| `eventType`       | meaning                              |
|-------------------|--------------------------------------|
| `release`         | this row IS a `tw_release` event     |
| `resolve_dispute` | this row IS a `tw_disp_resolve` event|

This fixes the reported bug where a row said `resolve_dispute` but its `txHash`
pointed at an `approve_and_release` transaction. That can no longer happen: hash and
type always belong to the same event. An escrow with 2 releases and 1 dispute
resolution now produces 3 rows.

Rows with `txHash: null` are synthetic fallbacks for escrows released before event
indexing began (one such row per escrow, timestamped with its last state change).

### 1.2 Amounts are escrow-cumulative + the `attributesRevenue` flag

The chain does not emit per-event amounts, so **every row repeats the escrow's
cumulative released total** in `amount`/`feeAmount`. To total revenue correctly:

- **`attributesRevenue: true` appears on exactly ONE row per escrow** (its last
  revenue event). Sum `feeAmount` **only over rows with `attributesRevenue: true`**,
  per token, and the result reconciles EXACTLY with `GET /analytics/revenue/monthly`.
- Summing over all rows double-counts. Never do it.
- Rows with `attributesRevenue: false` are history/audit rows — render them, do not
  total them.

### 1.3 Pagination semantics

- `pagination.total` now counts **event rows**, not escrows.
- New top-level field **`escrowTotal`**: distinct escrows across all pages of the
  current filter. Use `escrowTotal` wherever the UI says "N escrows".

### 1.4 New query parameters

| param      | values                          | notes |
|------------|---------------------------------|-------|
| `sort`     | `timestamp` (default) \| `amount` | `amount` is scale-normalized per token but still compares different currencies — combine with `asset` for an honest ranking |
| `order`    | `desc` (default) \| `asc`       | |
| `search`   | string                          | case-insensitive substring on organization name; unattributed rows never match |
| `asset`    | token contract id (C…)          | filters rows AND switches `topOrganizations` to fee-ranking |
| `eventType`| `release` \| `resolve_dispute`  | now filters each ROW by its own kind |
| `from`/`to`| ISO 8601                        | bounds on the row's own event timestamp |

### 1.5 New `topOrganizations` block (in the same response)

Top 10 organizations over the **full filtered dataset** (not the page), each escrow
counted once (attributing rows only):

```json
"topOrganizations": [
  {
    "organization": { "id": "12", "name": "Acme", "archived": false },
    "escrowCount": 16,
    "byAsset": [
      { "asset": { "address": "C…", "symbol": "USDC", "decimals": 7, "resolved": true },
        "escrowCount": 16, "releasedAmount": "263.5", "feeAmount": "0.7905" }
    ]
  },
  { "organization": null, "escrowCount": 1, "byAsset": [ … ] }
]
```

- `organization: null` = the unattributed bucket (real revenue, no platform match).
- Ranking rule: **by fee when the dataset is single-asset** (naturally, or because
  you passed `asset=`); otherwise **by `escrowCount`** — fees of different tokens
  are not comparable, so no cross-asset fee sum exists anywhere.
- `archived: true` platforms still rank (history is preserved); badge them.

### 1.6 Related semantic change in `revenue/monthly`

Both the ledger and the monthly series now attribute an escrow to its **last revenue
event of either kind** (`tw_release` OR `tw_disp_resolve`). Escrows that finished
via dispute resolution moved to the resolve month — a few historical buckets shifted
once at deploy. Categories `released`/`resolved` are unchanged: disjoint, safe to
stack.

---

## 2. Changed: `GET /analytics/escrows/status`

Now accepts optional `from`/`to` (ISO 8601) over the escrow **creation chain clock**.
Semantics: "current status of escrows CREATED in that range" — there is no status
history, so this is where those escrows stand TODAY, not a snapshot of the past.
With a bound set, escrows lacking a chain clock drop out (counted in
`data-quality.missingChainClock`). No params = previous behavior, byte-identical.

---

## 3. New endpoints (escrow metrics)

All under `Controller('analytics')`, `BACKOFFICE_ADMIN`, network-pinned.

### 3.1 `GET /analytics/escrows/top?by=amount|fee&limit=&from=&to=`

Per-asset leaderboards. `limit` (default 10, max 50) applies **per asset**;
`from`/`to` bound the creation chain clock. Response: `data: [{ asset, escrows: [...] }]`,
each escrow with `escrowId`, `engagementId`, `status`, `organization`, `createdAt`,
`amount`, `releasedAmount`, `feeAmount` (nullables documented in Swagger).

**Population asymmetry (deliberate, do not "fix"):**
- `by=amount`: **live escrows only** (removed/unprojected excluded) ranked by funded
  value → "biggest live escrows".
- `by=fee`: **revenue population** (includes escrows later removed on-chain —
  removal does not undo a release) ranked by released value → "biggest fees earned".

Never merge the per-asset boards into one global ranking.

### 3.2 `GET /analytics/escrows/conversion?granularity=day|week|month&periods=`

Created → released/resolved conversion as **cohorts on the creation chain clock**:
each bucket = "of the escrows created then, how many have released value today"
(`converted` uses the revenue predicate, so a multi-release escrow with one released
milestone counts). Response: `totals {created, converted, conversionPct}` +
continuous `data` buckets (empty buckets present with 0; `conversionPct: null` only
when nothing was created).

**UI requirement:** trailing cohorts are biased LOW by construction (no time to
release yet). Shade/annotate the most recent buckets; do not present them as a drop.

### 3.3 `GET /analytics/volume-vs-fees?granularity=&periods=`

Per (period × asset): `createdVolume`/`createdCount` (funded value of escrows
created in the bucket, creation clock) vs `releasedVolume`/`releasedCount`/`feeAmount`
(value released in the bucket, release attribution clock, both categories collapsed).
The fee is 0.3% of released volume **by definition** — that is why the chart pairs
input vs output. The two sides of one bucket describe **different escrow cohorts**
(created-then vs released-then); a missing side renders as `"0"`. Buckets are sparse
(only period×asset with data) — densify client-side if the chart needs it.

### 3.4 `GET /analytics/escrows/averages?from=&to=`

Per-asset KPIs: `createdCount`, `totalAmount`, `avgTicket` (created population,
unprojected rows excluded) and `releasedCount`, `totalReleased`, `avgReleased`,
`totalFee`, `avgFee` (revenue population). **The two denominators differ on
purpose** — do not divide fields across the two groups. Averages are `null` (not
`"0"`) when the population is empty. All divisions are exact integer floors at
base-unit precision.

---

## 4. New endpoints (API-key analytics) — `analytics/api-keys/*`

### The one fact that governs this whole surface

**Escrows record `platform_id`, never an api-key id.** Therefore every escrow-derived
number (revenue, volume, escrow counts) is **PLATFORM-level**: all keys belonging to
one platform report identical figures. Responses carry `attribution: "platform"` as
a machine-readable marker — group rows by `organization` in the UI, do not present
per-key revenue as if keys were independent.

**Request counts ARE per key**, but the counters only exist from the 2026-09-08
deploy onward. `usageTrackedSince` (in the summary) tells you the first day with
data; anything before it was never recorded and cannot be backfilled. Label
request-based views accordingly.

### 4.1 `GET /analytics/api-keys/summary?from=&to=`

`totalKeys`, `activeKeys` (active AND not expired), `revokedKeys`, `expiredKeys`,
`newInPeriod`, `withActivityInPeriod` (usage counters where they exist, `lastUsedAt`
recency as fallback for earlier time), `neverUsed`, `usageTrackedSince`
(`YYYY-MM-DD` or null). Key timestamps are real auth-side business time; keys are
not network-scoped.

### 4.2 `GET /analytics/api-keys/top?by=revenue|volume|escrows|requests&limit=&from=&to=`

- `revenue` / `volume` / `escrows`: rank via key → platform → escrows (revenue
  population; `from`/`to` bound the escrow creation chain clock). Items carry
  `escrowCount` + per-asset `byAsset` breakdown. **`revenue` and `volume` produce
  the same order** (fee is linear in released value) — only the displayed fields
  differ. Multi-asset datasets rank by `escrowCount` (same rule as
  `topOrganizations`). TW-operator keys (no platform) are excluded here.
- `requests`: ranks by summed daily counters (`from`/`to` bound usage days). Items
  carry `requestCount` (STRING — the counter is a 64-bit integer; do not parse into
  a JS number if you expect large values). Operator keys can appear, with
  `organization: null`.

### 4.3 `GET /analytics/api-keys/:keyId?from=&to=`

Drill-down: key metadata (`description`, `roles`, `active`, `createdAt`,
`expiresAt`, `lastUsedAt`, `lastUsedIp`), `organization`, `attribution`
(`"platform"` or `null` for operator keys), `escrowStats` (per-asset platform
revenue; empty for operator keys), and `usage` (this key's own daily
`{day, requestCount}` series). Unknown id → 404 (Problem Details body).

---

## 5. Integration checklist (do these in order)

1. Update the `revenue/events` client: new row fields (`attributesRevenue`), per-event
   semantics, `escrowTotal`, `topOrganizations`; switch any escrow-count display from
   `pagination.total` to `escrowTotal`.
2. Change every revenue totalization to filter `attributesRevenue === true` first.
3. Re-verify your reconciliation: Σ `feeAmount` (attributing rows, per token, per
   period) === the matching `revenue/monthly` bucket. This invariant is tested
   server-side; if your numbers diverge, the bug is in the client aggregation.
4. Wire the new params (`sort`, `order`, `search`, `asset`) to the table controls
   Joel requested; pass `asset` whenever showing a fee-ranked organization list.
5. Add the four new escrow-metric endpoints; respect per-asset grouping and the
   trailing-cohort shading on conversion.
6. Add the API-keys section; group escrow-derived rows by `organization` and show
   the `usageTrackedSince` disclaimer on anything request-based.
7. Keep rendering `GET /analytics/data-quality` alongside.

## 6. Field-name quick map (old → new, `revenue/events` only)

| old                          | new                                            |
|------------------------------|------------------------------------------------|
| row = escrow                 | row = event (`tw_release`/`tw_disp_resolve`)   |
| `eventType` (escrow-derived) | `eventType` (this row's own kind)              |
| `txHash` (last release)      | `txHash` (this row's own tx; null = synthetic) |
| `createdAt` (last release)   | `createdAt` (this row's own chain clock)       |
| —                            | `attributesRevenue` (sum only these)           |
| —                            | `escrowTotal`, `topOrganizations`              |
| `pagination.total` = escrows | `pagination.total` = event rows                |
