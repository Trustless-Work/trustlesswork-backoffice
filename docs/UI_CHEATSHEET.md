# UI cheatsheet

Quick reference for product UI: fonts, buttons, icons, badges, and escrow actions.

Canonical spec: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). If this file and the code disagree, **code wins**.

---

## Fonts

| Role | Family | CSS |
| --- | --- | --- |
| UI / headings | **Space Grotesk** | `--font-sans` / `font-sans` / `--font-heading` |
| Mono (addresses, IDs, version chips) | **Geist Mono** | `--font-geist-mono` / `font-mono` |

Load in `src/app/layout.tsx`. Body: `font-sans antialiased`.

### Type scale

| Use | Classes |
| --- | --- |
| Page H1 | `text-pretty text-2xl font-semibold tracking-tight md:text-3xl` |
| Detail title | `text-2xl font-semibold tracking-tight` |
| Section H2 | `text-lg font-semibold tracking-tight` |
| Card / list title | `text-base font-semibold` |
| Body / buttons | `text-sm font-medium` (buttons) · body `text-sm` |
| Muted copy | `text-sm text-muted-foreground` |
| Labels / micro | `text-xs text-muted-foreground` |
| Inputs (avoid iOS zoom) | `text-base md:text-sm` |
| Contract / version badges | `font-mono font-normal uppercase` |

---

## Buttons (`@/components/ui/button`)

Pill: `rounded-4xl`. Default SVG: `size-4`. Put icons with `data-icon="inline-start"` or `"inline-end"`.

### Variants

| `variant` | When |
| --- | --- |
| `default` | Primary CTA (`bg-primary` `#006be4`) |
| `outline` | Cancel, secondary, contract chips on cards |
| `secondary` | Quiet filled |
| `ghost` | Icon menus, clear filters, overflow |
| `destructive` | Soft only (`bg-destructive/10`) — never solid fill |
| `link` | Inline text action |

### Sizes

| `size` | Height | Typical use |
| --- | --- | --- |
| `default` | `h-9` | Forms, dialogs |
| `sm` | `h-8` | **Page header CTAs**, filter bar |
| `xs` | `h-6` | Rare dense chips |
| `lg` | `h-10` | Avoid in dashboard (marketing-ish) |
| `icon` | `size-9` | Square icon |
| `icon-sm` | `size-8` | Milestone `⋯` menu |
| `icon-xs` | `size-6` | Compact dismiss |
| `icon-lg` | `size-10` | Explorer links (custom circle, not always this size) |

**Dialog footer:** Cancel `variant="outline"` left → primary right.

### Escrow action triggers (not `Button`)

`EscrowActionTrigger` — full-width pills in the detail sidebar.

```
rounded-full border px-4 py-2.5 text-sm font-medium
icon size-4
```

| `triggerVariant` | Classes | Typical action |
| --- | --- | --- |
| `primary` | inverted `bg-foreground text-background` | Release, approve & release |
| `secondary` | `border-border bg-card` | Fund, withdraw, update, resolve |
| `danger` | `text-destructive` + `hover:bg-destructive/10` | Start dispute |

Milestone overflow: `Button variant="ghost" size="icon-sm"` + `MoreHorizontal`.

---

## Icon sizes (Lucide)

Always `lucide-react`. Default **`size-4`**.

| Context | Size |
| --- | --- |
| Button / action / inline | `size-4` |
| Badge | `size-3` (forced by Badge) |
| Chip dismiss / clear | `size-3` / `size-3.5` |
| Page header tile | `size-5 sm:size-6` in tile `size-12 sm:size-14` |
| NoData | `size-6` in well `size-14` |
| Status dot | `size-2` (`LiveStatusDot`) |
| Loading | `Loader2` / `Loader2Icon` `size-4 animate-spin` |

---

## Icons by action

Do not invent a second Lucide glyph for the same action.

### Escrow-level (`EscrowGeneralActions`)

| Action | Icon | Variant |
| --- | --- | --- |
| Section “Actions” | `Coins` | inverted circle `size-9` |
| Fund | `Wallet` | secondary |
| Withdraw remaining | `Banknote` | secondary |
| Update escrow | `Wrench` | secondary |
| Manage milestones | `ListTree` | secondary |
| Release funds | `CircleDollarSign` | primary |
| Start dispute | `ShieldAlert` | danger |
| Resolve dispute | `Gavel` | secondary |
| Accordion | `ChevronDown` | `size-4` |

### Milestone (`MilestoneActionsMenu` / batch toolbar)

| Action | Icon |
| --- | --- |
| Overflow | `MoreHorizontal` |
| Approve | `BadgeCheck` |
| Change status | `ListChecks` |
| Approve & release | `Zap` (primary) |
| Release milestone | `CircleDollarSign` (primary) |
| Start dispute | `ShieldAlert` (danger) |
| Resolve dispute | `Gavel` |

### Forms / lists

| Action | Icon |
| --- | --- |
| Add row / milestone | `PlusIcon` |
| Remove row | `Trash2Icon` |
| Create escrow (header) | `PlusIcon` |
| Create type picker | `FileStackIcon` |
| Reset filters | `RotateCcwIcon` (`size-3.5`) |
| Remove chip | `XIcon` (`size-3`) |
| Date range | `CalendarIcon` |
| Empty escrows | `DiscIcon` |
| Empty generic | `Inbox` |
| Copy | `CopyIcon` → success `CheckIcon` |
| Back | `ArrowLeft` / `ChevronLeftIcon` |
| External URL | `ExternalLinkIcon` |
| Stellar Expert | `ScanEye` |
| Trustless Work Viewer | `Telescope` |
| Deposits | `WalletIcon` |
| Events empty | `InboxIcon` |

### Escrow type badges

| Type | Icon |
| --- | --- |
| Single release | `Layers2` |
| Multi release | `LayersIcon` |

### Indexed events (`escrow-event-display.helper`)

| Kind | Icon | Label |
| --- | --- | --- |
| `deploy` | `RocketIcon` | DEPLOYED |
| `fund` | `BanknoteIcon` | FUNDED |
| `update` | `FilePenLineIcon` | UPDATED |
| `approve` | `CheckCircle2Icon` | APPROVED |
| `release` | `FlagIcon` | RELEASED |
| `dispute` | `GavelIcon` | DISPUTE STARTED |
| `resolve` | `ScaleIcon` | DISPUTE RESOLVED |
| `withdraw` | `Undo2Icon` | WITHDRAWN |
| fallback | `FlagIcon` | — |

Note: **action UI** uses `Gavel` for resolve and `ShieldAlert` for start dispute; **event timeline** uses `GavelIcon` for dispute and `ScaleIcon` for resolve. Keep that split.

---

## Badges

`h-5 rounded-4xl text-xs uppercase`. SVG `size-3`.

| Need | `variant` |
| --- | --- |
| Contract id / API version | `outline` + `font-mono` |
| Type (single / multi) | `outline` + type icon |
| Released / resolved | `secondary` |
| Disputed / error | `destructive` |
| Flag approved | `outline` |
| Flag released | `default` |
| Active (named exception) | inverted `bg-foreground text-background` + `LiveStatusDot` |

Do **not** use Badge `success` for domain status.

Escrow **card footer:** date left (`text-xs tabular-nums`) · API version badge right (`outline`).

---

## Controls density

| Control | Size |
| --- | --- |
| Input / Select | `h-8 rounded-lg` |
| Textarea | `min-h-16 rounded-lg` |
| Toggle | `h-8` · sm `h-7` |
| Switch | track ~18×32 · sm 14×24 |
| Checkbox | `size-4 rounded-[4px]` |
| Avatar | `size-8` (sm `6` / lg `10`) |

---

## Radius

| Class | Use |
| --- | --- |
| `rounded-4xl` | Button, Badge, filter pills |
| `rounded-lg` | Input, Select, Textarea |
| `rounded-xl` | Card, Dialog, Sheet, NoData |
| `rounded-2xl` | Container, amount tiles, action groups |
| `rounded-3xl` | Escrow panels / grid cards |
| `rounded-full` | Avatars, explorer buttons, action triggers, dots |

---

## Color (product)

Use tokens only: `background`, `foreground`, `card`, `muted`, `border`, `primary` (`#006be4`), `destructive`.

Forbidden in features: `bg-blue-*`, `text-green-600`, `emerald-*`, `purple-*`, raw hex (except `Lights` chrome).

---

## Spacing

| Layer | Gap / pad |
| --- | --- |
| Icon + label in a control | `gap-1` / `gap-1.5` |
| Sections | `gap-4` / `gap-6` |
| Form `FieldGroup` | `gap-5` |
| Shell | `p-4 md:px-8` |
| Navbar | `h-14 md:h-16` |
| Escrow panel | `p-6 sm:p-8` |
| Escrow card | `p-5` |
| Filter bar | `p-3 md:p-4` |

Prefer `gap-*` over `space-x` / `space-y`.

---

## Lists

Mobile cards `md:hidden` + desktop table `hidden md:block`. Empty → `NoData`. Loading → 1:1 `Skeleton`.
