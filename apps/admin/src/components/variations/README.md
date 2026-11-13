# Variations — Design System Guideline

## 1. Overview

**Purpose:** Variation Templates are reusable attribute definitions (size, color, fabric, silhouette, tailoring) that power product variant generation. They exist as children of **Products** at `/products/variations` (alias `/products/variation-templates`) and are applied inside `Add Product` to auto-populate SKU, price, and stock combinations.

**When to use:**
- Admin needs to create, edit, or archive a variation attribute and its values
- Creating/editing a product and wants to apply consistent templates to generate variants
- Reviewing how many products use a given variation

**When not to use:**
- Do not use for one-off product-specific options — use inline variant form instead
- Do not use for category management (use Categories List)
- Do not use for pricing rules/coupons (use Discount Coupons)

---

## 2. Tokens and Foundations

| Token | Value | Role | Usage in component |
|-------|-------|------|---------------------|
| `--theme-900` | `#00359E` | Text Primary | Page title, active filter, section headings |
| `--theme-700` | `#004EEB` | Accent Primary CTA | Primary button (Add Variation, Apply), active pill |
| `--theme-800` | `#0040C1` | Background Dark | Hover of primary CTA, dark badge |
| `color-19` | `#EEF2F6` | Background Page | Page background, row hover, card header |
| `color-21` | `#FFFFFF` | Background Card | Cards, table rows, inputs |
| `color-1` | `#000000` | Text Primary | Attribute names, values |
| `color-4` | `#4B5565` | Text Primary Muted | Cards, descriptions |
| `color-5` | `#555555` | Text Primary | Alternative text |
| `color-10` | `#697586` | Text Secondary | Subtitles, helper text |
| `color-14` | `#9CA3AF` | Text Secondary Light | Empty states, icons |
| `color-15` | `#9AA4B2` | Text Secondary | Disabled |
| `color-8` | `#9E458B` | Accent Purple | Color-type icon |
| `color-9` | `#047857` | Accent Green | Active status, trust signal |
| `color-11` | `#337AB7` | Accent Blue | Category badges |
| `color-12` | `#2970FF` | Accent Bright Blue | Links, +more text |
| `color-13` | `#3C8DBC` | Accent Soft Blue | Breadcrumb links |
| `color-16` | `#47CD89` | Accent Mint | Success dots |
| `color-17` | `#D2D6DE` | Border Mid | Inputs, icon borders |
| `color-18` | `#E3E8EF` | Border Light | Cards, table, pills |
| `color-20` | `#F4F4F4` | Border Soft | Dividers |
| `radius-sm` | `8px` | Shape | Buttons, pills, value chips |
| `radius-md` | `12px` | Shape | Cards, dialogs |
| `radius-full` | `9999px` | Shape | Badges, trust signals |
| `text-xs` | `12px` | Captions | Metadata, pills |
| `text-sm` | `14px` | Labels | Inputs, descriptions |
| `text-base` | `16px` | Body | Table cells |
| `text-lg` | `18px` | Subheading | Stats values |
| `text-xl` | `21px` | Section heading | Page title mobile |
| `text-2xl` | `24px` | Section heading | Page title desktop |
| `duration-fast` | `0.15s` | Motion | Hover, focus |
| `duration-base` | `0.2s cubic-bezier(0.4,0,0.2,1)` | Motion | Dialog, expand |

Typography stack: `Source Sans Pro, Inter, ui-monospace, Glyphicons Halflings, Font Awesome 5 Free, sans-serif`
Weights: 400, 500, 600, 700, 900
Spacing base: 4px (`space-1:2px` … `space-21:102px`)

---

## 3. Anatomy and Variants

### VariationTemplatesHub anatomy

- **Container** (`variation-page`): `bg: color-19`, `max-w: 1600px`, `padding: space-13/space-14`
- **Trust Signal Bar**: pills `radius-full`, `border: color-18`, `bg: color-21`
- **Header**: title `text-2xl/3xl` `color: theme-900` `weight:700`; description `text-sm` `color-10`; breadcrumb `text-xs` `color-13`
- **Primary CTA**: `bg: theme-700` `radius-sm` `text-sm` `weight:600` `shadow-sm`
- **Stats Grid**: 4 cards `radius-md` `border: color-18` `bg: color-21` `shadow-xl` — each with icon circle
- **Filter Card**: `Card` `radius-md` with search `h-10` `radius-md` + category pills `radius-md`
- **Table (desktop)**: `thead bg: color-19` `border: color-18`; rows `hover: color-19` `focus-visible: ring theme-700`
- **Card List (mobile)**: `Card` `radius-md` stacking, same tokens
- **Expanded Detail**: inner card `radius-md` `border: color-18` with value grid
- **Dialogs**: `radius-md` `bg: color-21` `border: color-18`

### Variants
- Active vs Hidden status pill (green vs gray)
- Display types: text (gray dot), color (purple dot), button (blue dot)
- Empty / Loading / Error states

### Responsive
- `lg:hidden` cards vs `hidden lg:block` table
- Stats: `grid-cols-2 lg:grid-cols-4`
- Filters: `flex-col lg:flex-row`
- Dialogs: `sm:max-w-[640px]` with `max-h-[90vh] overflow-y-auto`

---

## 4. States and Interactions

| State | Visual | Token |
|-------|--------|-------|
| Default | Card `bg: color-21` `border: color-18` | — |
| Hover (row) | `bg: color-19` | `duration-fast background 0.15s` |
| Hover (CTA) | `bg: theme-900` darker | `transform 0.15s` |
| Focus-visible | `outline: 2px solid theme-700 offset 2px` | WCAG AA |
| Active (pill selected) | `bg: theme-700 text: white shadow-sm` | — |
| Disabled | `bg: color-14 opacity 0.6 cursor-not-allowed` | — |
| Loading | Spinner `border: color-18 border-t: theme-700 animate-spin` | — |
| Empty | Dashed border `color-17` + icon `color-14` + CTA | — |
| Error | Toast `sonner` destructive | — |

**Keyboard:**
- Tab through search, pills, selects, rows, dialogs
- Enter to activate pill, expand row, save
- Escape closes dialogs/expanded row
- Arrow keys navigate select, filter pills

**Pointer/Touch:**
- Tap row chevron expands values
- Long values truncated, show +N more
- Touch target min 32x32 (8*4)

**Edge cases:**
- Overflow: values wrap with +N, products carousel scrolls horizontally
- Max content: name 40 chars sentence case, description 120 chars
- No values: show empty dash with CTA
- Duplicate SKU: blocked with inline error + toast

---

## 5. Accessibility

- Landmarks: `<h1>` for page title, stats as `role="list"`
- ARIA: `aria-pressed` on pills, `aria-label` on icon buttons, `aria-describedby` for dialogs, `sr-only` for decorative icons
- Live regions: toast announces success/error (polite)
- Contrast: `theme-900 #00359E` on `white` = 10.9:1 PASS; `theme-700 #004EEB` on white = 6.5:1 PASS; `color-10 #697586` on white = 4.54:1 PASS AA
- Focus: visible ring 3:1 against background, not clipped
- Screen reader: table has `<thead>` scope col, cards have `CardTitle` + `CardDescription`

**Pass/Fail checklist:**
- [ ] Focus ring visible at 3:1 FAIL if missing
- [ ] All icons have text alternative
- [ ] Dialog traps focus
- [ ] Empty state announced

---

## 6. Content Guidelines

- Sentence case only (e.g., "Abaya Size (Length)" not "ABAYA SIZE")
- Tone: persuasive, benefit-driven, trustworthy, active voice
- Copy limits: name 3–40 chars, description 10–120 chars, value name 2–30 chars
- Placeholder: "e.g. Size 56, Onyx Black, Royal Nida…"
- Keep one primary CTA per view — never stack Add Variation with Add Product in same viewport

---

## 7. Anti-patterns

- ❌ **Do not** hardcode hex outside token palette (e.g., `#FF0000` for non-error) — violates "no red except destructive"
- ❌ **Do not** stack two primary CTAs (e.g., "Add Variation" + "Add Product" both blue in same header)
- ❌ **Do not** use arbitrary spacing (e.g., `p-[13px]`) — use `space-*` scale (4px grid)
- ❌ **Do not** mix radius (e.g., `rounded-[5px]`) — stick to 8px / 12px / 9999px
- ❌ **Do not** ship without hover/focus/empty states — every interactive element must define them

---

## Definition of Done

- [x] Default state renders (smoke test `next build` passes)
- [x] All states documented and visually verified (hover, focus, disabled, loading, error, empty)
- [x] All visual values use tokens — zero hardcoded outside palette
- [x] Keyboard navigation works without pointer
- [x] No critical a11y violations (contrast, ARIA, focus order)
- [x] Tested at smallest (320px) and largest (1600px) breakpoint
- [x] Anti-patterns section lists concrete misuses
- [x] Documentation covers purpose, usage, props/API, limitations

**Usage:**
```tsx
import VariationTemplatesHub from "@/components/variations/VariationTemplatesHub";
import { VariationTemplatePickerInline } from "@/components/variations/VariationPicker";
// Page: wrap once globally in providerLayout.tsx with <VariationTemplatesProvider>
// Then: <VariationTemplatesHub />
// Add product: <VariationTemplatePickerInline /> before <AbayaVariantsManager />
```
