# Composition — Trustless Work house style

> **Canonical:** [`docs/DESIGN_SYSTEM.md`](../../../../docs/DESIGN_SYSTEM.md) (§10–15). This file is a quick extract for agents; update the canonical doc when recipes change.

How feature screens compose primitives. Code exemplars: dashboard shell + escrows/settings/orgs UI.

---

## A. App shell

```tsx
// Main content (dashboard layout)
"flex flex-col gap-2 p-4 md:min-h-[calc(100svh-4rem)] md:px-8"

// Navbar
"sticky … border-b bg-background/80 backdrop-blur-md"
"flex h-14 … px-3 md:h-16 md:px-8"
```

- `SidebarProvider` (often `defaultOpen={false}`)
- Ambient `Lights` (soft brand-blue blurs) — chrome only, not content styling
- No global `max-w-*` on main — full inset width

Feature section gaps under header: usually `gap-4` or `gap-6`.

---

## B. Page header

```tsx
"flex flex-col gap-4 pb-2"

// Icon tile
"size-12 … rounded-lg border bg-muted/10 sm:size-14"
// Icon
"size-5 sm:size-6"

// Title
"text-pretty text-2xl font-semibold tracking-tight md:text-3xl"

// Description
"max-w-2xl text-sm text-muted-foreground md:text-base"
```

Actions via `DashboardPageHeaderActions`:

```tsx
"flex w-full flex-col gap-3 sm:flex-row … lg:w-auto lg:gap-4"
// CTAs: Button size="sm" + RoundedTabs when needed
```

---

## C. Page body surfaces

### Container (settings, API keys, list shells)

`@/components/shared/Container`:

```
w-full rounded-2xl border border-border bg-card/40 p-6 shadow-sm
```

Transparent wrapper when nesting custom panels:

```tsx
<Container className="border-none bg-transparent p-0 shadow-none">
  <div className="flex flex-col gap-6">…</div>
</Container>
```

### Escrow detail panels (signature)

```tsx
<section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
  <h2 className="text-lg font-semibold tracking-tight">…</h2>
  …
</section>
```

### Escrow grid card

```tsx
<article className="min-h-[18rem] rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-lg">
```

Nested amount tiles: `rounded-2xl border-2 px-3 py-2.5`.

Grid: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`.

### Settings / org cards

Use shadcn `Card` + `CardHeader` / `CardTitle` / `CardDescription` / `CardContent`.  
Header actions: `Button size="sm"`.

Label/value field:

```
text-xs text-muted-foreground  →  text-sm font-medium
```

Side-by-side: `flex flex-col gap-6 md:flex-row` · children `w-full md:w-1/2`.

---

## D. Filter bar

```tsx
"rounded-xl border border-border bg-card p-3 md:p-4"

// Control
"h-9 w-full rounded-4xl border-border bg-background dark:bg-transparent …"

// Label + control
"space-y-1.5"

// Rows
"flex flex-col gap-3 lg:flex-row lg:items-end"

// Chips
<Badge variant="outline" className="gap-1 capitalize">… <XIcon className="size-3" /></Badge>

// Active count
<Badge variant="secondary">…</Badge>

// Clear
<Button variant="ghost" size="sm"><RotateCcwIcon className="size-3.5" /> Clear</Button>
```

---

## E. Dual layouts (lists / tables)

Breakpoint **`md`**:

```tsx
<div className="flex flex-col gap-3 md:hidden">
  {/* Card per row — title in header, 2-col label grid */}
</div>
<div className="hidden md:block">
  {/* Table */}
</div>
```

Skeletons must mirror **both** layouts (`SKELETONS.mdc`).

Mobile card pattern:

```tsx
<Card>
  <CardHeader className="flex flex-row … pb-3">
    <CardTitle className="text-base">…</CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-3">…</CardContent>
</Card>
```

---

## F. Empty / error / loading

### Empty

Always `@/components/shared/NoData`:

```
rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center
icon well: size-14 rounded-full border bg-muted · Icon size-6
title: mt-5 text-base font-semibold
description: mt-1.5 max-w-sm text-sm text-muted-foreground
action: Button mt-6
```

Center in list areas: `flex min-h-0 flex-1 items-center justify-center`.

### Loading

Co-located `*Skeleton` with `Skeleton` from `@/components/ui/skeleton` — structural 1:1 fidelity.

### Errors

Prefer consistent retry UI (banner / NoData-style with action). Avoid inventing new error card styles per screen. Soft wells when needed: `border-destructive/30 bg-destructive/5`.

---

## G. Dialogs / forms

| Type | Layout |
| --- | --- |
| Simple action | Default `DialogContent` (`sm:max-w-sm`); fields `flex flex-col gap-2 py-4` |
| Multi-step create | Override width `sm:max-w-4xl lg:max-w-5xl` + `max-h-[92vh]`; body `gap-5`; grids `gap-4 md:grid-cols-2` |
| Confirm | `AlertDialog` defaults |

**Footer convention:**

```tsx
<DialogFooter>
  <Button type="button" variant="outline">Cancel</Button>
  <Button type="submit">Primary</Button>
</DialogFooter>
```

Cancel left (`outline`); primary right. Destructive abandon is rare — do not default Cancel to `destructive`.

---

## H. Typography hierarchy (app)

| Level | className |
| --- | --- |
| Dashboard H1 | `text-2xl font-semibold tracking-tight md:text-3xl` |
| Detail H1 | `text-2xl font-semibold tracking-tight` |
| Section H2 | `text-lg font-semibold tracking-tight` |
| Card / list title | `text-base font-semibold` |
| Body muted | `text-sm text-muted-foreground` (+ `leading-relaxed` on long copy) |
| Micro labels | `text-xs text-muted-foreground` |

---

## I. Icons & avatars

| Use | Size |
| --- | --- |
| Inline UI | `size-4` |
| Chip dismiss / meta | `size-3` / `size-3.5` |
| Page header | `size-5` → `sm:size-6` |
| Empty | `size-6` in `size-14` well |
| Profile | `UserAvatar` + often `size-16 rounded-xl` |
| Status dot | `size-2` |
| Role circle | button `size-10`, icon `size-4` |

---

## J. Badge status (product)

| Status | Variant / treatment |
| --- | --- |
| disputed | `destructive` |
| released / resolved | `secondary` |
| approved flag | `outline` |
| released flag | `default` |
| active | inverted `bg-foreground text-background` + live dot — **named exception**, don’t invent more |

No dedicated `success` / `warning` / `info` Badge variants — map to existing ones.

---

## K. New feature screen recipe

```tsx
// 1. Header actions → DashboardPageHeaderActions (Button size="sm" ± RoundedTabs)
// 2. Body:
<Container>
  {/* optional filter: rounded-xl border bg-card p-3 md:p-4, h-9 rounded-4xl controls */}
  {/* list: gap-4 grid; empty → NoData */}
  {/* or settings: flex flex-col gap-6 md:flex-row → Card md:w-1/2 */}
</Container>

// Detail:
<section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
  <h2 className="text-lg font-semibold tracking-tight">…</h2>
</section>

// Tables: dual md:hidden cards + hidden md:block Table
// Dialogs: Cancel outline → primary; fields gap-2/gap-3 or FormItem grid gap-4
```

Prefer: `border-border`, `bg-card`, `text-muted-foreground`, `rounded-xl|2xl|3xl`, `gap-4`/`gap-6`, `size-4` icons, Badge `outline|secondary|destructive`, `NoData`.

---

## Anti-patterns — do NOT codify as standards

Documented so agents avoid copying accidental inconsistencies:

1. **Raw palette in product** — `text-green-600`, `bg-emerald-500`, `text-red-500` for status (use Badge / semantic tokens).
2. **Cancel as `destructive`** in create escrow footer — prefer `outline` Cancel like Fund/org dialogs.
3. **One-off error cards** — align with NoData + retry or one soft destructive well pattern.
4. **Inventing more inverted badges** beyond active escrow — product-specific exception only.
5. **Mixing Card vs custom `article`** on the **same** list surface.
6. **Dashboard analytics idioms** (gradient separators, chart-heavy `DashboardCard`) — third dialect; not default for CRUD/settings/escrows.
7. **Inline `rgba(0,107,228,…)`** outside ambient Lights chrome.

---

## Marketing exception {#marketing-exception}

Home / marketing uses a **different** visual language. Do **not** copy into dashboard/features:

| App | Marketing |
| --- | --- |
| `text-2xl` / `text-lg` semibold | `text-5xl md:text-7xl`, gradients, TypingAnimation |
| Semantic `bg-card` / Container | Glass `border-2 border-border/50 bg-background/10 backdrop-blur-md` |
| Semantic tokens | Raw `blue-*` / `green-*` / `purple-*` utilities |
| Header CTA `size="sm"` | Hero `size="lg"` |
| Soft `Lights` | Stronger `BackgroundLights` (incl. purple) |

If building marketing: do not apply escrow panel / Container recipes blindly. If building product: ignore marketing patterns.
