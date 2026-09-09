# Trustless Work — Design System

Canonical document for the product visual language (dApp / dashboard / features / settings). Self-contained and portable: copy it into another project along with the CSS tokens and primitives described here.

| | |
| --- | --- |
| **Runtime (code)** | `src/app/globals.css`, `src/components/ui/*`, `src/components/shared/*` |
| **Agents (Cursor)** | `.cursor/rules/DESIGN_SYSTEM.mdc` → points here |
| **Skill (Claude)** | `.claude/skills/trustless-work-ui/` → points here |

If code and this document diverge, **code wins** — update this file in the same PR.

---

## 1. Purpose and scope

### What it covers

- Tokens (color, radius, typography, elevation, focus)
- Density and controls
- shadcn primitives catalog (`radix-luma`) and product chrome
- Composition recipes (shell, headers, lists, filters, dialogs)
- States: loading / empty / error
- Review checklist and porting guide

### What it does not cover

- Marketing / home / landing (a **separate** visual language — see [§14](#14-marketing-exception))
- Feature architecture, RHF/Zod forms, or data fetching (see `FORMS.mdc`, `DAPP.mdc`)
- npm package / Figma kit

### Guiding principle

Stay on the existing visual line. Do not invent a new aesthetic in product UI. Compose with CVA variants; use `className` for layout only (flex, grid, width, margin) — not to recolor primitives.

---

## 2. Stack and dependencies

| Layer | Value |
| --- | --- |
| UI kit | shadcn **`radix-luma`** (`components.json`) |
| CSS | Tailwind **v4** — `@import "tailwindcss"` + `@theme inline` (no `tailwind.config`) |
| CSS animation | `tw-animate-css` + `shadcn/tailwind.css` |
| Tokens | CSS variables in `globals.css` · `cssVariables: true` · `baseColor: neutral` |
| Dark mode | `class` on `<html>` via `next-themes` · `@custom-variant dark (&:is(.dark *))` |
| Fonts | Space Grotesk → `--font-sans` / `font-heading` · Geist Mono → `--font-geist-mono` |
| Icons | Lucide (`iconLibrary: lucide`) |
| Utility | `cn()` = `clsx` + `tailwind-merge` |

Typical `ThemeProvider`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

---

## 3. Brand and color

### 3.1 Primary scale (hex — same in light and dark)

| Token | Value |
| --- | --- |
| `--primary-50` | `#e6f7ff` |
| `--primary-100` | `#bae7ff` |
| `--primary-200` | `#91d5ff` |
| `--primary-300` | `#69c3ff` |
| `--primary-400` | `#40b1ff` |
| `--primary-500` | `#006be4` |
| `--primary-600` | `#0050b3` |
| `--primary-700` | `#0050b3` |
| `--primary-800` | `#003a8c` |
| `--primary-900` | `#00275c` |

- `--primary` = `var(--primary-500)` in **both** modes
- `--primary-foreground` = `#ffffff`
- `--ring` = `var(--primary-500)`
- `--sidebar-primary` = `var(--primary-500)`
- Utilities: `bg-primary`, `text-primary`, `bg-primary-50`…`bg-primary-900`, `hover:bg-primary/80`

### 3.2 Semantic tokens — light (`:root`)

| Token | Value |
| --- | --- |
| `--background` | `oklch(1 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` |
| `--card` / `--popover` | `oklch(1 0 0)` |
| `--card-foreground` / `--popover-foreground` | `oklch(0.145 0 0)` |
| `--secondary` / `--muted` / `--accent` | `oklch(0.97 0 0)` |
| `--secondary-foreground` / `--accent-foreground` | `oklch(0.205 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` |
| `--border` / `--input` | `oklch(0.922 0 0)` |
| `--sidebar` | `oklch(0.985 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` |

### 3.3 Semantic tokens — dark (`.dark`)

| Token | Value |
| --- | --- |
| `--background` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.985 0 0)` |
| `--card` / `--popover` | `oklch(0.205 0 0)` |
| `--card-foreground` / `--popover-foreground` | `oklch(0.985 0 0)` |
| `--secondary` / `--muted` / `--accent` | `oklch(0.269 0 0)` |
| `--secondary-foreground` / `--accent-foreground` | `oklch(0.985 0 0)` |
| `--muted-foreground` | `oklch(0.708 0 0)` |
| `--destructive` | `oklch(0.704 0.191 22.216)` |
| `--border` | `oklch(1 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 15%)` |
| `--sidebar` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.985 0 0)` |
| `--sidebar-accent` | `oklch(0.269 0 0)` |
| `--sidebar-border` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.556 0 0)` |

### 3.4 Charts (same light / dark — gray ramp)

| Token | Value |
| --- | --- |
| `--chart-1` | `oklch(0.87 0 0)` |
| `--chart-2` | `oklch(0.556 0 0)` |
| `--chart-3` | `oklch(0.439 0 0)` |
| `--chart-4` | `oklch(0.371 0 0)` |
| `--chart-5` | `oklch(0.269 0 0)` |

### 3.5 Product usage

| Need | Token / class |
| --- | --- |
| Page bg / text | `bg-background` / `text-foreground` |
| Surface | `bg-card` · border `border-border` |
| Secondary copy | `text-muted-foreground` |
| Primary CTA | `bg-primary text-primary-foreground` |
| Soft destructive | `bg-destructive/10 text-destructive` |
| Soft elevated edge | `ring-1 ring-foreground/10` |

**House opacities:** `bg-card/20` (Card default) · `bg-card/40` (Container) · `dark:bg-input/30` (fields).

**Forbidden in features:** `bg-blue-*`, `text-green-600`, `emerald-*`, `purple-*`, arbitrary hex (except ambient `Lights` chrome). Prefer opacity modifiers (`dark:bg-input/30`) over `dark:bg-gray-*`.

---

## 4. Typography

### Fonts

```tsx
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

- `html`: font variables · `body`: `font-sans` + `antialiased`
- `--font-heading` = same as sans

### House hierarchy

| Level | Classes |
| --- | --- |
| Dashboard H1 | `text-pretty text-2xl font-semibold tracking-tight md:text-3xl` |
| Detail H1 | `text-2xl font-semibold tracking-tight` |
| Section H2 | `text-lg font-semibold tracking-tight` |
| Card / list title | `text-base font-semibold` |
| CardTitle (primitive) | `font-heading … font-bold` |
| Body / default UI | `text-sm` · muted → `text-muted-foreground` |
| Micro (Badge, labels) | `text-xs text-muted-foreground` |
| Inputs (mobile zoom) | `text-base md:text-sm` |
| Controls | `font-medium` |

---

## 5. Radius

Base: `--radius: 0.625rem` (10px).

| Token | Formula | ≈ |
| --- | --- | --- |
| `--radius-sm` | `* 0.6` | 6px |
| `--radius-md` | `* 0.8` | 8px |
| `--radius-lg` | `= --radius` | 10px |
| `--radius-xl` | `* 1.4` | 14px |
| `--radius-2xl` | `* 1.8` | 18px |
| `--radius-3xl` | `* 2.2` | 22px |
| `--radius-4xl` | `* 2.6` | 26px |

### Usage map (required)

| Class | Use |
| --- | --- |
| `rounded-4xl` | Button, Badge, filter pills |
| `rounded-lg` | Input, Select, Textarea, Toggle, Alert |
| `rounded-xl` | Card, Dialog, Sheet, Empty/NoData, inset sidebar |
| `rounded-2xl` | Container, nested amount tiles |
| `rounded-3xl` | Escrow detail panels / escrow grid cards |
| `rounded-full` | Avatar, Switch, status dots |
| `rounded-md` | Menu items, Skeleton, tab triggers — **never** Button/Badge |
| `rounded-[4px]` | Checkbox only |

---

## 6. Density and spacing

| Element | Spec |
| --- | --- |
| Input / Select / Toggle | `h-8` |
| Button default | `h-9` · `size="sm"` → `h-8` · header CTAs → prefer `sm` |
| Badge | `h-5` `text-xs` |
| Icon default | `size-4` |
| Icon compact | `size-3` / `size-3.5` |
| Icon page header | `size-5 sm:size-6` |
| Control gaps | `gap-1` / `gap-1.5` |
| Sections | `gap-4` / `gap-6` |
| Form FieldGroup | `gap-5` |
| Shell pad | `p-4 md:px-8` |
| Navbar | `h-14 md:h-16` · `bg-background/80 backdrop-blur-md` |
| Container | `p-6` |
| Escrow panel | `p-6 sm:p-8` |
| Filter bar | `p-3 md:p-4` |

**Rule:** flex/grid siblings use **`gap-*`**, not `space-x` / `space-y` (except title→description stacks).

---

## 7. Elevation, focus, and invalid

### Elevation

| Pattern | When |
| --- | --- |
| `ring-1 ring-foreground/10` | Preferred — Card, Dialog, Popover, menus |
| `shadow-sm` | Container, active tab, inset sidebar, RoundedTabs indicator, escrow card at rest |
| `shadow-md` | Select / Popover / Dropdown content |
| `shadow-lg` | Sheet; escrow card **hover** only — not default card chrome |
| Tooltip | Filled `bg-foreground` — no shadow |

### Focus

```
focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
```

- Buttons: `ring-ring/30`
- Global: `* { @apply border-border outline-ring/50; }`

### Invalid

```
aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
```

(+ dark `/50`, `/40` depending on the control).

---

## 8. Motion

| Source | Use |
| --- | --- |
| `tw-animate-css` | `animate-in` / `animate-out`, fade, zoom, slide (overlays ~`duration-100`, sheet ~`200`) |
| Theme toggle | View Transitions API (`data-magicui-theme-vt`, Magic UI vars) |
| Typing | `--animate-blink-cursor` |
| 3D helpers | `.perspective-1000`, `.backface-hidden`, `.rotate-y-180` (auth/marketing) |

In product: discreet overlay motion; no decorative animation clutter on CRUD screens.

### Scrollbar / Sonner

- Scrollbar: 6px · thumb `color-mix(… muted-foreground 28%)` · hover `45%` · util `.scrollbar-hide`
- Sonner: icon well `1.75rem` · close `2rem rounded-full` · escrow toast `max-width: min(calc(100vw - 2rem), 24rem)`

---

## 9. Primitives catalog

Location: `src/components/ui/`. Prefer **CVA variants/sizes** over color overrides.

### 9.1 Button

Base: `rounded-4xl` · `text-sm font-medium` · focus `ring-ring/30` · default svg `size-4` · `cursor-pointer`.

| Variant | Treatment |
| --- | --- |
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` |
| `outline` | border · `bg-background` · dark transparent / `hover:bg-input/30` |
| `secondary` | `bg-secondary` |
| `ghost` | hover muted |
| `destructive` | **soft** `bg-destructive/10 text-destructive` (no solid fill) |
| `link` | `text-primary` underline on hover |

| Size | Height |
| --- | --- |
| `default` | `h-9` |
| `xs` | `h-6` |
| `sm` | `h-8` |
| `lg` | `h-10` |
| `icon` / `icon-xs` / `icon-sm` / `icon-lg` | `size-9` / `6` / `8` / `10` |

Icons: `data-icon="inline-start" | "inline-end"`.

### 9.2 Input / Textarea / Select

**Input:** `h-8 rounded-lg border-input` · `px-2.5` · `text-base md:text-sm` · focus ring/50 · `dark:bg-input/30`.

**Textarea:** same border/focus; `min-h-16` · `field-sizing-content`.

**SelectTrigger:** `rounded-lg` · `data-[size=default]:h-8` · `sm:h-7`.

**SelectContent:** `rounded-lg shadow-md ring-1 ring-foreground/10`.

**InputGroup:** shell mirrors Input.

**InputOTPSlot:** `size-8` · ends `rounded-l/r-lg`.

### 9.3 Card

```
rounded-xl bg-card/20 ring-1 ring-foreground/10
[--card-spacing:--spacing(4)] · data-[size=sm]:[--card-spacing:--spacing(3)]
```

No default box-shadow. Title: `font-heading font-bold`. Footer: `border-t bg-muted/50`.

**Note:** escrow grids often use `article` + `rounded-3xl` instead of Card; settings/orgs use Card. Do not mix both on the **same** list surface.

### 9.4 Badge

`h-5 rounded-4xl text-xs` · svg forced `size-3`.

Variants in code: `default` | `secondary` | `destructive` (soft) | `outline` | `ghost` | `link` | **`success`** (emerald in CVA).

**Product convention:** do not use `success` / invent `warning` / `info` for domain status. Map to the table in [§12](#12-icons-and-status-badges). The `success` variant exists in code but is **not** the dApp status dialect.

### 9.5 Overlays

| Component | Keys |
| --- | --- |
| Overlay | `bg-black/10` + `backdrop-blur-xs` · fade `duration-100` |
| DialogContent | `rounded-xl` · `sm:max-w-sm` · `ring-1 ring-foreground/10` · footer strip `bg-muted/50` |
| AlertDialog | `max-w-xs` / `sm:max-w-sm` |
| Sheet | `w-3/4 sm:max-w-sm` · `shadow-lg` · slide `duration-200` |
| Drawer (vaul) | `rounded-t/b-xl` · handle `h-1 w-[100px] rounded-full bg-muted` |
| Popover / Dropdown / etc. | `rounded-lg` · `shadow-md` · soft ring |
| Tooltip | `bg-foreground text-background text-xs` |

Multi-step create flows: width exception `sm:max-w-4xl lg:max-w-5xl` + `max-h-[92vh]`.

### 9.6 Table

- Overflow wrapper; `text-sm`
- Head: `h-10 font-medium`
- Row: `border-b hover:bg-muted/50`
- Cell: `p-2 align-middle`

### 9.7 Tabs / RoundedTabs / Toggle / Switch

**Tabs (shadcn):** list `rounded-lg bg-muted h-8` · trigger `rounded-md` · active `bg-card shadow-sm`.

**RoundedTabs** (`custom-tab.tsx`) — house segmented control:

```
rounded-full border bg-muted/60 p-1
indicator: rounded-full bg-card shadow-sm ring-1 ring-border
tab: rounded-full px-4 py-2 text-sm [&_svg]:size-4
```

**Toggle:** `rounded-lg` · default `h-8` · sm `h-7` · lg `h-9`.

**Switch:** default track ~18×32 · sm ~14×24 · checked `bg-primary` · `rounded-full`.

**Checkbox:** `size-4 rounded-[4px]` · checked primary.

**Radio:** `size-4 rounded-full` · indicator `size-2`.

### 9.8 Misc

| Primitive | Notes |
| --- | --- |
| Skeleton | `animate-pulse rounded-md bg-muted` |
| Avatar | `size-8` default · sm `6` · lg `10` · `rounded-full` (`UserAvatar` often `rounded-lg` — intentional) |
| Alert | `rounded-lg` · variants `default` / `destructive` |
| Progress | `h-1 rounded-full` · indicator `bg-primary` |
| Spinner | `Loader2Icon size-4 animate-spin` |
| Kbd | `h-5 rounded-sm bg-muted text-xs` |
| FieldGroup | `gap-5` |
| Sidebar | width `16rem` · mobile `18rem` · icon `3rem` · menu btn `h-8` · inset `rounded-xl shadow-sm` |
| Empty (ui) | dashed `rounded-xl` — for product lists prefer **NoData** |

### 9.9 Forms

RHF + Zod + `@/components/ui/form` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`). Dialog spacing: `gap-2` / `gap-3` / grid `gap-4`. Do not invent parallel form layout systems.

---

## 10. Product chrome (`shared/`)

| Component | Role | Key spec |
| --- | --- | --- |
| **NoData** | **Required** empty state | `rounded-xl border-dashed` · icon well `size-14` · icon `size-6` · title `text-base font-semibold` · optional CTA |
| **Container** | Settings / list shell | `rounded-2xl border bg-card/40 p-6 shadow-sm` |
| **DashboardPageHeader** | Page header | Icon tile + H1 + description + Separator |
| **DashboardPageHeaderActions** | Portal CTAs into header | `Button size="sm"` ± RoundedTabs |
| **Navbar** | Sticky shell | blur, height `h-14 md:h-16` |
| **Lights** | Ambient brand blurs | Chrome only — do not style content with it |
| **LiveStatusDot** | Status dot | `size-2` |
| **RoundedTabs** | Segmented tabs | See §9.7 |

Transparent Container when nesting custom panels:

```tsx
<Container className="border-none bg-transparent p-0 shadow-none">
  <div className="flex flex-col gap-6">…</div>
</Container>
```

---

## 11. Composition recipes

### 11.1 App shell

```tsx
// Main
"flex flex-col gap-2 p-4 md:min-h-[calc(100svh-4rem)] md:px-8"

// Navbar
"sticky border-b bg-background/80 backdrop-blur-md"
"flex h-14 px-3 md:h-16 md:px-8"
```

- `SidebarProvider` (often `defaultOpen={false}`)
- No global `max-w-*` on main — full inset width
- Feature gaps under header: `gap-4` / `gap-6`

### 11.2 Page header

```tsx
// Icon tile
"size-12 rounded-lg border bg-muted/10 sm:size-14"
// Icon: size-5 sm:size-6
// Title: text-pretty text-2xl font-semibold tracking-tight md:text-3xl
// Desc: max-w-2xl text-sm text-muted-foreground md:text-base
```

### 11.3 Body surfaces

**Escrow detail panel (signature):**

```tsx
<section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
  <h2 className="text-lg font-semibold tracking-tight">…</h2>
</section>
```

**Escrow grid card:**

```tsx
<article className="min-h-[18rem] rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-lg">
```

Nested amount tiles: `rounded-2xl border-2 px-3 py-2.5`.  
Grid: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`.

**Settings / org:** shadcn `Card` + Header/Title/Description/Content. Label→value: `text-xs text-muted-foreground` → `text-sm font-medium`. Side-by-side: `flex flex-col gap-6 md:flex-row` · `md:w-1/2`.

### 11.4 Filter bar

```tsx
"rounded-xl border border-border bg-card p-3 md:p-4"
// Control: h-9 w-full rounded-4xl border-border bg-background dark:bg-transparent
// Rows: flex-col gap-3 lg:flex-row lg:items-end
// Chips: Badge outline + XIcon size-3
// Clear: Button ghost sm + RotateCcw size-3.5
```

### 11.5 Dual layout (lists / tables)

Breakpoint **`md`**:

```tsx
<div className="flex flex-col gap-3 md:hidden">{/* Card list */}</div>
<div className="hidden md:block">{/* Table */}</div>
```

Mobile card: title in `CardHeader` · fields in `grid grid-cols-2 gap-3`.  
Same data for both layouts. One shared `NoData` / error for both.

### 11.6 Dialogs

| Type | Layout |
| --- | --- |
| Simple action | Default `sm:max-w-sm` · fields `gap-2 py-4` |
| Multi-step create | `sm:max-w-4xl lg:max-w-5xl` + `max-h-[92vh]` · body `gap-5` · grids `gap-4 md:grid-cols-2` |
| Confirm | `AlertDialog` defaults |

**Footer (required):**

```tsx
<DialogFooter>
  <Button type="button" variant="outline">Cancel</Button>
  <Button type="submit">Primary</Button>
</DialogFooter>
```

Cancel `outline` left → primary right. Do not default Cancel to `destructive`.

### 11.7 New feature screen

```tsx
// 1. Actions → DashboardPageHeaderActions (Button size="sm" ± RoundedTabs)
// 2. Body:
<Container>
  {/* optional filter bar */}
  {/* list gap-4 / empty → NoData */}
  {/* or settings: flex-col gap-6 md:flex-row → Card md:w-1/2 */}
</Container>
```

---

## 12. Icons and status badges

### Icons (Lucide)

| Context | Size |
| --- | --- |
| Inline / Button svg | `size-4` |
| Chip dismiss / clear | `size-3` / `size-3.5` |
| Page header | `size-5` → `sm:size-6` |
| NoData | `size-6` in well `size-14` |
| Badge | `size-3` (forced) |
| Status dot | `size-2` |
| Sidebar | `size-4` |
| Profile avatar | often `size-16 rounded-xl` |

### Badge status (product)

| Status | Treatment |
| --- | --- |
| disputed / error | `destructive` |
| released / resolved | `secondary` |
| approved (flag) | `outline` |
| released (flag) | `default` |
| active | inverted `bg-foreground text-background` + `LiveStatusDot` — **named exception**; do not invent more inverted badges |

---

## 13. States: loading / empty / error

### Loading (skeletons)

1. Only `@/components/ui/skeleton` — structural fidelity **1:1** with loaded UI
2. Co-locate above the export or in a sibling `*Skeleton.tsx`
3. If dual layout, skeletonize **both**
4. Lists: 3–5 rows/cards with the same gap/padding
5. Skeletonize the default state (e.g. profile view, not the edit form)

**Forbidden:** a lone `Skeleton className="h-48 w-full"`, invented `bg-muted` placeholders, generic loaders.

### Empty

Always `NoData` (`title` required; `description` / `icon` / `actionLabel`+`onAction` optional).  
No custom dashed empties, no placeholder `<p>`. Do not use NoData for loading or as the only error UI.

### Error

Banner / retry / soft well: `border-destructive/30 bg-destructive/5`. One consistent pattern — do not invent per-screen error cards.

---

## 14. Marketing exception

Home / marketing is a **different** visual language. Do not copy into the dashboard:

| Product | Marketing |
| --- | --- |
| `text-2xl` / `text-lg` semibold | `text-5xl md:text-7xl`, gradients, TypingAnimation |
| `bg-card` / Container | Glass `bg-background/10 backdrop-blur-md` |
| Semantic tokens | Raw `blue-*` / `green-*` / `purple-*` |
| Header CTA `size="sm"` | Hero `size="lg"` |
| Soft `Lights` | Stronger `BackgroundLights` (incl. purple) |

---

## 15. Do / Don’t

### Do

- Semantic tokens only in product
- CVA variants before `className` color overrides
- Radius map (pills / fields / cards / panels)
- Heights: inputs `h-8`, buttons `h-9` or `sm`
- Icons `size-4` (or documented exception)
- Empty → `NoData`; loading → Skeleton 1:1
- Data tables → dual `md`
- Dialog: Cancel outline → primary
- Light + dark via CSS vars

### Don’t

- Raw palettes in features
- Marketing aesthetics in dashboard
- `rounded-md` / non-pill on Button / Badge
- Solid destructive fill as default
- Custom empties / generic loaders
- Recolor Card/Dialog via `className`
- Invent Badge dialects (`success`/`warning` as domain convention)
- Mix Card vs `article` on the same list
- Hard-coded `dark:bg-gray-*`
- Cancel as `destructive` by default
- More inverted badges than “active”
- `rgba(0,107,228,…)` outside Lights chrome

---

## 16. Review checklist

```
- [ ] Semantic tokens only (no raw palette in product UI)
- [ ] Radius matches map (pill buttons, lg fields, xl cards, 3xl escrow panels)
- [ ] Heights: inputs h-8, buttons h-9 or sm
- [ ] Icons size-4 (or documented exception)
- [ ] Empty → NoData; loading → Skeleton 1:1 (both layouts if dual)
- [ ] Data tables: dual md cards + desktop table
- [ ] Dialog footer: Cancel outline → primary right
- [ ] Light + dark OK without hard-coded greys
- [ ] No marketing/hero aesthetics in dashboard
- [ ] className used for layout, not recoloring primitives
- [ ] Badge status mapped to destructive / secondary / outline / default (± active exception)
```

---

## 17. Porting guide (another project)

### Copy / adapt

1. **Tokens** — `:root`, `.dark`, `@theme inline`, and brand scale from `globals.css` (or Tailwind v4 equivalent)
2. **`components.json`** — `style: radix-luma`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`
3. **Fonts** — Space Grotesk + Geist Mono via `next/font` (or the framework’s loader)
4. **Primitives** — Button, Input, Card, Badge, Dialog, Table, Skeleton, etc. with the CVA in this doc
5. **Shared recipes** — reimplement `NoData`, `Container`, header pattern (path names are free)
6. **Theme** — `next-themes` (or equivalent) with `attribute="class"`
7. **Util** — `cn()` with `clsx` + `tailwind-merge`

### Do not need to copy

- Domain features (escrows, orgs, API keys)
- `Lights` / marketing ambient
- Analytics dashboard dialect (third language — not default CRUD)
- Exact `@/` paths — adapt aliases

### Suggested order in a new repo

1. Install Tailwind v4 + shadcn radix-luma  
2. Paste CSS tokens  
3. Generate / port key primitives (Button, Input, Card, Badge, Dialog, Table, Skeleton)  
4. Add `NoData` + `Container`  
5. Adopt this `DESIGN_SYSTEM.md` as the canonical source  
6. Apply the checklist on the first product screen

### Sources of truth in this monorepo

| Artifact | Path |
| --- | --- |
| This document | `docs/DESIGN_SYSTEM.md` |
| CSS tokens | `src/app/globals.css` |
| Fonts | `src/app/layout.tsx` |
| shadcn config | `components.json` |
| UI primitives | `src/components/ui/` |
| Product chrome | `src/components/shared/` |
| Cursor cheatsheet | `.cursor/rules/DESIGN_SYSTEM.mdc` |
| Skeletons detail | `.cursor/rules/SKELETONS.mdc` |
| Agent skill | `.claude/skills/trustless-work-ui/` |

---

_Last consolidation: aligned with the Trustless Work backoffice dApp (radix-luma · Space Grotesk · primary `#006be4`)._
