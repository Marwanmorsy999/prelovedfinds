# Preloved Finds — Remaining Redesign Fixes

## Context

The major design overhaul is already present in the codebase (styles, navigation, footer, product card/info/gallery, homepage, shop, about, contact). This plan documents the remaining gaps between the current state and the provided design specification.

## Current State

- Clean working tree on main branch
- TypeScript compiles cleanly
- Core spec (palette, typography, navigation, cards, gallery, routes) appears implemented

## Remaining Gaps — Prioritized

### P0 — Functional / Critical

| #   | Issue                                                  | Location                         | Action                                                                                                           |
| --- | ------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Product page grid is 50/50 instead of 60/40            | `src/routes/product.$id.tsx`     | Change `md:grid-cols-2` to `md:grid-cols-[2fr_1fr]`                                                              |
| 2   | Product page missing breadcrumbs                       | `src/routes/product.$id.tsx`     | Add `Home / Shop / {brand} / {title}` breadcrumb line above grid                                                 |
| 3   | Product page related-products heading/style mismatches | `src/routes/product.$id.tsx`     | Change "More Picks" → "You might also like", use `font-display text-[28px] font-bold uppercase`                  |
| 4   | Product page related-products divider                  | `src/routes/product.$id.tsx`     | Change `border-hairline` to `border-concrete`                                                                    |
| 5   | Unsaved wishlist state in ProductInfo                  | `src/components/ProductInfo.tsx` | Connect "Save for later" button to same localStorage wishlist logic as ProductCard, show filled heart when saved |
| 6   | Badge font sizes below 11px floor                      | Multiple components              | Update `text-[10px]` to `text-[11px]` in StatusBadge, ProductCard, ProductInfo badges                            |

### P1 — Spec Compliance

| #   | Issue                                                      | Location                                      | Action                                                                                                                  |
| --- | ---------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 7   | Product grid gap and container width                       | `src/components/ProductGrid.tsx`, route files | Use uniform `gap-6` (24px) instead of `gap-x-4 gap-y-10`. Widen to `max-w-[1440px]` for product grids                   |
| 8   | FilterDropdown still uses native `<select>`                | `src/components/FilterDropdown.tsx`           | Replace with a custom `<div role="listbox">` dropdown or accept native select with custom styling via `appearance-none` |
| 9   | Category tiles need real background images (future)        | `src/components/CategoryTiles.tsx`            | Component ready; wire product images from backend when tile-image field exists                                          |
| 10  | Instagram grid placeholders                                | `src/routes/index.tsx`                        | Replace `bg-surface` divs with actual images from Instagram API or static assets                                        |
| 11  | Mobile cart badge font size                                | `src/components/Navigation.tsx`               | Update badge from `text-[10px]` to `text-[11px]`                                                                        |
| 12  | Saved-count social proof should be dynamic                 | `src/components/ProductInfo.tsx`              | Replace static "24 people saved this" with useMemo count from wishlist or backend                                       |
| 13  | Shop filter panel missing actual category/size/era filters | `src/routes/shop.tsx`                         | Add Category, Size, Era radio groups to filter panel and wire to `updateSearch` (requires backend support)              |
| 14  | Search button in nav is non-functional                     | `src/components/Navigation.tsx`               | Click could focus shop search or open command palette (low priority)                                                    |
| 15  | `__root.tsx` not loading Helvetica Now Text font           | `src/routes/__root.tsx`                       | Either add Adobe Fonts/self-hosted link or confirm Inter-as-primary fallback is acceptable                              |

### P2 — Polish

| #   | Issue                                              | Location                            | Action                                                                      |
| --- | -------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| 16  | Varied section padding rhythm not fully consistent | `src/routes/index.tsx`              | Verify hero-footer section gaps alternate 80/120/80/120; tweak where needed |
| 17  | Product gallery counter font size                  | `src/components/ProductGallery.tsx` | Optional: bump to `text-[12px]`                                             |
| 18  | Footer payment icons text vs icons                 | `src/components/Footer.tsx`         | Replace text placeholders with SVG icons when available                     |

## Out of Scope

- Signing up for Adobe Fonts / procuring Helvetica Now Text font files (user/designer-owned asset)
- Real Instagram API integration (requires API credentials)
- Wire-up contact/newsletter to email backend (Formspree/Resend) — accepted as TODO mid-spec

## Validation

1. `bun run lint` → pass
2. `npx tsc --noEmit` → pass (currently passes)
3. Visual inspection: homepage hero, featured drop, shop filters, product 60/40 layout, about stats, contact form success state

## Execution Order

1. Fix P0 items 1–6 (layout, breadcrumbs, related products style, ProductInfo wishlist, badge font floor)
2. Fix P1 items 7–13 (grid widths/gaps, custom select, image wire-up, dynamic social proof, filter panel expansion)
3. Polish P2 items 16–18 (padding rhythm, gallery counter, footer icons)
4. Verify all validation steps
