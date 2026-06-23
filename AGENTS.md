<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# JCMS Frontend — Architecture Reference

## What this app is
A CMS page builder. Staff users toggle **layout mode** to visually edit pages: resize/split/delete columns, reorder nested components, drag-and-drop. Public users see rendered content. All edits sync to a MongoDB backend via debounced mutations.

## Tech stack
- **Next.js 16.2.4** (App Router), **React 19**, **TypeScript 5**
- **Jotai 2** — UI/layout state (atoms, atomFamily)
- **TanStack Query 5** — server state (queries + mutations)
- **Tailwind CSS 4** (no config file — uses CSS-based config in `globals.css`)
- **@dnd-kit/react 0.4.0** — drag and drop
- **PrimeReact 10** — dialog, menubar, button primitives
- **Axios** — HTTP via `axiosConfig.ts` (baseURL: `localhost/api`)
- **Lodash** — cloneDeep, debounce, isEqual, omit
- **pnpm** — package manager

## Data model hierarchy
```
PageMeta (_id, href)
  └── PageMetaRow (id, twelvePtColSpan: PartitionOf12, ordinal)
        └── PageMetaCol (id, height: px, nPtRowSpan: string, components[])
              └── CoreComponent (id, type: PageComponentType, title, content)
```

`PageComponentType` enum: `CARD | DEFAULT | FORM | TABLE`

## The grid systems (two separate, nested)

### Outer grid — columns within a row
`twelvePtColSpan` is a `PartitionOf12` branded string like `"4-4-4"` or `"6-3-3"`. Parts must sum to 12. Use `isPartitionOf12()` for runtime validation before assigning. Maps to Tailwind `col-span-N` via `COL_SPAN_CLASS` in `libs/tailwindConstants/ColSpanClassConstant.ts`.

### Inner grid — components within a column
`nPtRowSpan` is a plain dash-separated string like `"8-4"` — the N-point row spans for each component within the column's CSS grid. Parts don't need to sum to 12. `SNAP = 32px` is the minimum row unit; min component height is `SNAP * 3 = 96px`. Column height is stored in px and must be a multiple of `SNAP`.

### Height recalculation
`calculateNewActiveSpans(height, currentSpan)` in `DG_ManagementHooks.ts` scales all row spans proportionally when a column is resized. It enforces the min-3 unit floor and adjusts the largest/smallest span to correct rounding errors.

## Mutation debounce strategy
- **Column span changes** (`twelvePtColSpan`, `cols`): 1000ms debounce via `useTwelvePtColSpanTracker`
- **Column height changes** (`cols`): 500ms debounce via `useHeightTracker`
- **Component row operations** (split, delete, erase, resize): immediate via `setupComponentRowTracker`

When sending layout mutations, always **strip `components` from cols** — they are not a layout concern. Pattern used throughout: `cols.map(({ components: _, ...layout }) => layout)`.

## State management pattern
Jotai atoms live in `DG_ManagementHooks.ts` (per-grid instance) and `hooks/managementHooks.ts` (global). The DynamicGrid initialises atoms for `metaId`, `rowId`, `twelvePtColSpan`, `DynamicGridColumns`, `contentWidth`. Child components read from atoms via `useAtom`/`useAtomValue` rather than prop-drilling.

`useComponentUpdateTracker` merges incoming server state with local state: it preserves local `height` and `ordinal` while accepting all other server field updates.

## Component naming convention
Prefix hierarchy mirrors file hierarchy:
- `DG_*` — DynamicGrid level
- `DG_CM_*` — ColumnManager level (inside a column)
- `DG_CM_CM_*` — ComponentManager level (inside a column's component stack)
- `DG_O_*` — Overlay controls at column level
- `L_*` — Layout-level components
- `L_EMB_*` — EditableMenuBar

Hooks that don't follow `use*` naming: `setupComponentRowTracker` is called as a hook (uses `useEffect` internally) but is named as a setup function — don't rename it without checking all call sites.

## Key files
| File | Purpose |
|------|---------|
| `app/__types/PageMeta.ts` | Core data types |
| `app/__types/CoreComponent.ts` | Component type enum |
| `app/__types/TwelvePtColSpan.ts` | Branded type + `isPartitionOf12` validator |
| `hooks/metaHooks.ts` | Page metadata queries/mutations; exports `SNAP`, `DEFAULT_COLUMN_HEIGHT` |
| `hooks/componentHooks.ts` | Component CRUD; exports `blankComponentTemplate` |
| `hooks/managementHooks.ts` | Global atoms: `layoutModeAtom`, `isAdminAtom` |
| `components/_base/DynamicGrid/DG_ManagementHooks.ts` | Grid-scoped atoms + height/span trackers |
| `components/_base/DynamicGrid/DG_ColumnManager/DG_CM_ManagementHooks.ts` | Component row operations (split, delete, erase, resize) |
| `libs/tailwindConstants/ColSpanClassConstant.ts` | `COL_SPAN_CLASS` map: span number → Tailwind class |
| `libs/tailwindConstants/RowSpanClassConstant.ts` | `ROW_SPAN_CLASS` map |

## Staff-gated UI
`isAdmin` is checked via `authoriseHooks.ts` (hits `/auth/status`). Layout overlays, edit controls, and `DMG_DefaultItem` add-buttons only render when `isAdmin && layoutMode`. Pass `isAdmin` down explicitly; don't read it inside deep child components.

## Coding style
- **No early returns as guard clauses.** Never write `if (!foo) return`. Instead, wrap the function body: `if (foo) { ... }`. Early returns bury where a function actually returns and make control flow harder to follow.

## Current branch: `drag1`
Working on drag-and-drop reorder for components within a column (`DG_CM_CM_O_DragAndDrop`). `@dnd-kit/react` is already installed. The `DG_CM_CM_ComponentWrapper` is in flux — the parent currently passes `gridRowOffset`/`gridRowLength` as computed props, but there is ongoing work to change how grid placement is passed.
