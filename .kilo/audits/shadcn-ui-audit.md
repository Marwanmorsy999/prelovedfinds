# Preloved Finds — shadcn/ui Implementation Audit

**Audited by:** Senior Frontend Engineer & UI/UX Designer  
**Date:** July 7, 2026  
**Scope:** All custom components, shadcn/ui integration, styles, routes, animations

---

## 1. Design Consistency — Audit & Recommendations

### ✅ What's Working Well

- **Zero-radius theme** (`--radius: 0px` everywhere) is intentionally applied and creates a strong, utilitarian/vintage aesthetic that matches the brand.
- **CSS variable color system** in `styles.css` is well-structured with semantic tokens (`--color-ink`, `--color-concrete`, `--color-paper`, etc.).
- **Typography hierarchy** is consistent: uppercase tracking-widest for labels, bold for headings, clean 13–14px for body.
- **Monochrome palette** with green accent for "in stock" status creates clear information hierarchy.

### 🔴 Issues Found

| Issue                                                                                                                                                                                                                                                          | Location                                                                                                                                    | Severity   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Inconsistent color references** — Most components use hardcoded hex values (`#1a1a1a`, `#6b7280`, `#e5e7eb`, `#f4f4f4`, `#9ca3af`) instead of CSS variables                                                                                                  | `Navigation.tsx`, `ProductCard.tsx`, `Footer.tsx`, `Newsletter.tsx`, `ProductInfo.tsx`, `shop.tsx`, `index.tsx`, `about.tsx`, `contact.tsx` | **High**   |
| **Font mismatch** — `styles.css` sets `font-family: 'Helvetica Neue Bold', 'Helvetica Neue', 'Inter'` on `html, body`, but `@theme` defines `--font-sans: "Inter"` and components use Tailwind font utilities. Helvetica Neue Bold may not load on all systems | `styles.css` (line 93)                                                                                                                      | **Medium** |
| **shadcn/ui components use CSS variables** (e.g., `--background`, `--foreground`), but custom components bypass the variable system entirely — they won't pick up theme changes                                                                                | All custom components vs. `components/ui/*`                                                                                                 | **High**   |
| **Two navigation systems coexist** — `Navigation.tsx` (the one actually rendered in `__root.tsx`) and `PillNav.tsx` (imported but unused). This creates confusion and maintenance burden                                                                       | `Navigation.tsx`, `PillNav.tsx`                                                                                                             | **Medium** |
| **Status badges are duplicated** — `StatusBadge.tsx` exists as a reusable component but ProductCard and ProductInfo both inline their own badge markup                                                                                                         | `StatusBadge.tsx`, `ProductCard.tsx` (lines 27–41), `ProductInfo.tsx` (lines 57–71)                                                         | **Low**    |
| **Spacing inconsistencies** — Navigation uses `h-20` (80px), shop page header uses `py-7` (28px), about page uses `py-16` (64px). No consistent spacing scale for section padding                                                                              | Multiple files                                                                                                                              | **Medium** |

### 🎯 Recommendations

1. **Refactor all hardcoded colors to CSS variable references.** Create a utility for this:

   ```tsx
   // Instead of text-[#1a1a1a]  →  text-ink
   // Instead of text-[#6b7280]  →  text-concrete
   // Instead of border-[#e5e7eb] →  border-hairline
   // Instead of bg-[#f4f4f4]    →  bg-surface
   ```

   This is a mechanical but transformative change — every component becomes themable from `styles.css`.

2. **Unify the navigation.** Either use `Navigation.tsx` (the custom one) or refactor to use shadcn's `NavigationMenu` component (`ui/navigation-menu.tsx`). If keeping `Navigation.tsx`, remove `PillNav.tsx` fully.

3. **Establish a spacing/rhythm contract:**
   - Section padding: `py-16 md:py-20`
   - Section heading bottom margin: `mb-8`
   - Card spacing: `gap-x-4 gap-y-10`
   - Product page gutter: `gap-6 md:gap-8`

4. **Fix font stack.** If Helvetica Neue Bold is intentional, ensure it's loaded via `@font-face` or fall back to Inter consistently. The `@theme` and `body` should agree.

---

## 2. Animations & Micro-interactions — Audit & Recommendations

### ✅ What's Working Well

- **Page enter animation** (`fade-in` keyframe) provides a subtle 0.3s entrance.
- **Cart drawer slide** uses `transition-transform duration-300 ease-out` — smooth.
- **Product card hover scale** (`group-hover:scale-[1.04]` on image) adds polish.
- **Mobile menu slide** uses consistent timing with cart.
- **Skeleton shimmer** animation exists in styles (though not used for image loading).
- **Marquee** is a classic CSS infinite scroll — pairs well with the brand energy.

### 🔴 What's Missing / Can Be Improved

| Issue                                                                                                                              | Location                                                       | Severity   |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| **No image loading transitions** — Product images pop in with no blur-up, skeleton, or fade. High CLS risk                         | `ImageSlot.tsx`, `ProductCard.tsx`, `ProductGallery.tsx`       | **High**   |
| **No scroll-triggered animations** — Products, sections appear all at once. No "staggered reveal" or entrance animations on scroll | `index.tsx`, `shop.tsx`                                        | **Medium** |
| **Cart "Added" feedback is purely a state toggle** — no shake, no bounce, no toast confirmation animation                          | `ProductCard.tsx` (line 55-56), `ProductInfo.tsx` (line 34-39) | **Medium** |
| **Zoom lightbox has no transition** — it appears/disappears instantly. Missing a scale-in or fade                                  | `ProductGallery.tsx` (lines 46-69)                             | **Low**    |
| **Filter panel toggles abruptly** — `hidden` / `block` switch on mobile with no animation                                          | `shop.tsx` (line 187)                                          | **Medium** |
| **Grid column switch has no transition** — items jump between 2-col and 4-col layouts abruptly                                     | `shop.tsx` (lines 288-321)                                     | **Low**    |
| **Mobile menu hamburger animation** is basic opacity-only or none in `Navigation.tsx`                                              | `Navigation.tsx`                                               | **Low**    |
| **No hover micro-interactions** on category tiles (aside from overlay opacity)                                                     | `CategoryTiles.tsx`                                            | **Low**    |
| **No loading skeleton** for product grids while data is fetching                                                                   | `ProductGrid.tsx`, `shop.tsx`                                  | **Medium** |

### 🎯 Recommendations

1. **Add blur-up image loading pattern.** Use a low-res placeholder + transition to full-res:

   ```css
   .image-blur-load {
     filter: blur(20px);
     transition: filter 0.4s ease-out;
   }
   .image-blur-load.loaded {
     filter: blur(0);
   }
   ```

2. **Implement staggered entrance animations with Intersection Observer** (no heavy library needed):

   ```tsx
   // Custom hook: useStaggeredReveal(ref, { threshold: 0.1, stagger: 0.08 })
   // Each child fades in + translates up slightly, staggered
   ```

3. **Animate the cart add action** with a micro-bounce or scale pulse:

   ```css
   @keyframes cart-bounce {
     0%,
     100% {
       transform: scale(1);
     }
     50% {
       transform: scale(1.15);
     }
   }
   ```

4. **Add a scale-in transition for the zoom lightbox:**

   ```css
   /* Replace instant appearance with: */
   .zoom-enter {
     animation: zoomFadeIn 0.25s ease-out;
   }
   @keyframes zoomFadeIn {
     from {
       opacity: 0;
       transform: scale(0.95);
     }
     to {
       opacity: 1;
       transform: scale(1);
     }
   }
   ```

5. **Animate filter panel** using max-height + opacity transition instead of `hidden`/`block`.

6. **Add loading skeleton grid** that matches the product card dimensions exactly to prevent CLS.

---

## 3. Smoothness & UX — Audit & Recommendations

### ✅ What's Working Well

- **Responsive layout** is sound: mobile-first, clean breakpoints, no horizontal overflow.
- **Cart drawer** has proper Escape key handling and outside-click dismiss.
- **Focus-visible outlines** are implemented globally in `styles.css`.
- **Reduced motion media query** is respected globally.
- **Custom scrollbar** styling is subtle and on-brand.
- **Backdrop blur** on cart overlay provides visual depth.

### 🔴 Issues Found

| Issue                                                                                                                                                           | Location                              | Severity   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------- |
| **`pt-[80px]` on main content is fragile** — if header height changes (e.g., admin link appears), content offset may be wrong                                   | `__root.tsx` (line 160)               | **Medium** |
| **ProductCard "Add to Cart" button is inside a `<Link>`** — buttons inside links violate accessibility guidelines. Clicking the button also triggers navigation | `ProductCard.tsx` (lines 19, 44-73)   | **High**   |
| **Cart drawer lacks focus trapping** — tabbing can move focus behind the overlay. Screen reader users can get lost                                              | `Navigation.tsx` (lines 128-194)      | **High**   |
| **CategoryTiles use `<a href>` instead of `<Link>`** — causes full page reloads instead of SPA navigation                                                       | `CategoryTiles.tsx` (line 18)         | **Medium** |
| **Footer links also use `<a href>` instead of `<Link>`** — same issue                                                                                           | `Footer.tsx` (lines 31, 60)           | **Medium** |
| **Newsletter form doesn't submit anywhere** — `onSubmit` just sets `done` state, no API call or validation                                                      | `Newsletter.tsx` (lines 21-26)        | **High**   |
| **No image fallback/placeholder** — if `imageSrc` or `slots[active]` is undefined, the image slot renders an empty background with no visual indicator          | `ImageSlot.tsx`, `ProductGallery.tsx` | **Medium** |
| **Shop page grid column toggle (`2` vs `4`) doesn't persist** — resets on page navigation                                                                       | `shop.tsx` (line 91)                  | **Low**    |
| **No "skip to content" link** for keyboard users                                                                                                                | `__root.tsx`                          | **Medium** |
| **Mobile menu body scroll lock** is applied/unapplied via useEffect — can cause race conditions on route changes                                                | `Navigation.tsx` (lines 21-24)        | **Low**    |

### 🎯 Recommendations

1. **Fix the button-inside-link anti-pattern in ProductCard.** Restructure so the card link wraps only the image/title, and the "Add to Cart" button is a sibling outside the link:

   ```tsx
   <div className="group">
     <Link to="/product/$id">...</Link>
     <button onClick={handleAdd}>Add to Cart</button>
   </div>
   ```

2. **Add focus trapping** to the cart drawer. Use the existing `ui/dialog.tsx` or a lightweight focus-trap utility (`focus-trap-react` or a custom hook).

3. **Replace `<a href>` with TanStack Router `<Link>`** in `CategoryTiles.tsx`, `Footer.tsx`, and `index.tsx` hero CTA.

4. **Replace the manual `pt-[80px]`** offset with CSS that auto-computes:

   ```css
   /* In styles.css */
   :root {
     --nav-height: 80px;
   }
   .main-content {
     padding-top: var(--nav-height);
   }
   ```

5. **Implement a real form submission** for the newsletter (or at minimum, show a validation error and store to localStorage as a fallback).

6. **Add "Skip to content" link** at the top of `RootShell`:

   ```tsx
   <a href="#main-content" className="sr-only focus:not-sr-only ...">
     Skip to content
   </a>
   ```

7. **Persist grid column preference** via localStorage or search params (move `gridCols` state to search params).

---

## 4. Implementation Best Practices — Audit & Recommendations

### ✅ What's Working Well

- **shadcn/ui is properly configured** in `components.json` with `"style": "new-york"`, CSS variables enabled, and proper aliases.
- **Tailwind v4** with `@import "tailwindcss"` and `@theme` is modern and correct.
- **`cn()` utility** (`clsx` + `twMerge`) is available and used correctly.
- **TypeScript types** for products and cart are well-defined.
- **Route loader pattern** with TanStack Router is well-executed.
- **Image optimization** via Cloudinary is set up.
- **Reduced motion** preference is respected globally.

### 🔴 Issues Found

| Issue                                                                                                                                                                                                                   | Location                                                              | Severity   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| **Duplicate filter selectors** — `FilterDropdown.tsx` is a custom wrapper around native `<select>`, but `ui/select.tsx` (shadcn Select) exists in the project and is unused                                             | `FilterDropdown.tsx`, `ui/select.tsx`                                 | **Medium** |
| **No use of shadcn `ui/button.tsx`** — all buttons are custom-styled. Loses the benefit of shadcn variants, sizes, and focus ring consistency                                                                           | All components                                                        | **Medium** |
| **No use of `cn()` for conditional classes** — many components manually interpolate class strings which is error-prone                                                                                                  | `Navigation.tsx`, `shop.tsx`, `ProductCard.tsx`, `ProductGallery.tsx` | **Medium** |
| **Hamburger lines use `transition: all 0.01s ease`** — effectively disables CSS transitions, relying entirely on GSAP. Heavy dependency for hamburger animation                                                         | `PillNav.css` (line 196)                                              | **Low**    |
| **GSAP dependency for sporadic micro-animations** — GSAP (±30KB) is imported in `PillNav.tsx` which doesn't appear to be used in the app. If it's planned for use, consider lighter alternatives or CSS-only animations | `PillNav.tsx`                                                         | **Medium** |
| **`MarqueeTicker` duplicates DOM content for loop** — CSS marquee can be achieved with a single set + `overflow: hidden` + `translateX(-50%)` without duplicating children                                              | `MarqueeTicker.tsx` (lines 27-32)                                     | **Low**    |
| **`useCart` cart item key uses `product.id`** — fine for now, but if the same product can be added with different options (size, condition), the key would collide                                                      | `ProductInfo.tsx` (line 35)                                           | **Low**    |
| **No proper loading/error state in shop route** — the loader fetches but there's no Suspense boundary or error boundary for the product list                                                                            | `shop.tsx`                                                            | **Medium** |
| **`registerLocations` for `--font-display` and `--font-mono` are defined but `--font-display` is never used** — dead CSS variables                                                                                      | `styles.css` (lines 34-35)                                            | **Low**    |

### 🎯 Recommendations

1. **Adopt shadcn `Button` component** across the site. This gives you access to `variant`, `size`, `disabled` states, and consistent focus rings automatically:

   ```tsx
   import { Button } from "@/components/ui/button";
   <Button variant="default" size="lg" className="uppercase tracking-widest">
     Add to Cart
   </Button>;
   ```

2. **Replace `FilterDropdown.tsx` with shadcn `Select`** for consistent styling, keyboard navigation, and accessibility.

3. **Use `cn()` for ALL conditional class compilation** — it's already in the project, use it:

   ```tsx
   // Instead of:
   className={`text-${active ? "ink" : "concrete"}`}
   // Use:
   className={cn("text-concrete", active && "text-ink")}
   ```

4. **Remove GSAP if `PillNav.tsx` is not used** — saves ~30KB bundle size. If keeping, evaluate if CSS-only animations can replace the hover effects.

5. **Optimize the marquee** to avoid DOM duplication:

   ```tsx
   // Use a single content set with CSS animation translating -50%
   // The parent overflow: hidden handles the clipping
   ```

6. **Add Suspense boundaries** around async data regions (shop grid, product pages) for better loading UX.

7. **Add the `color-scheme` meta tag** to support proper system dark mode if ever needed.

---

## 5. Quick-Win Action Items (Priority Order)

### 🔥 P0 — Critical (A11y + UX bugs)

| Action                                                    | File                              | Complexity |
| --------------------------------------------------------- | --------------------------------- | ---------- |
| Restructure ProductCard to remove button inside Link      | `ProductCard.tsx`                 | 15 min     |
| Add focus trapping to cart drawer                         | `Navigation.tsx`                  | 30 min     |
| Replace `<a href>` with `<Link>` in CategoryTiles, Footer | `CategoryTiles.tsx`, `Footer.tsx` | 10 min     |
| Add "Skip to content" link                                | `__root.tsx`                      | 5 min      |

### ⚡ P1 — High Visual Impact

| Action                                                          | File                                 | Complexity |
| --------------------------------------------------------------- | ------------------------------------ | ---------- |
| Refactor hardcoded colors → CSS variables across all components | All components                       | 1–2 hours  |
| Add image loading skeleton/blur-up to ProductCard               | `ProductCard.tsx`, `ImageSlot.tsx`   | 30 min     |
| Add staggered scroll-reveal animation for product grids         | Custom hook + `ProductGrid.tsx`      | 1 hour     |
| Animate cart "Added" feedback with micro-bounce                 | `ProductCard.tsx`, `ProductInfo.tsx` | 15 min     |
| Add transition to zoom lightbox                                 | `ProductGallery.tsx`                 | 10 min     |

### 📋 P2 — Polish & Best Practices

| Action                                               | File                             | Complexity |
| ---------------------------------------------------- | -------------------------------- | ---------- |
| Replace custom filter selects with shadcn `Select`   | `FilterDropdown.tsx`, `shop.tsx` | 30 min     |
| Use `cn()` for all conditional classnames            | All components                   | 30 min     |
| Remove unused PillNav / GSAP or refactor to CSS-only | Project cleanup                  | 20 min     |
| Animate filter panel open/close                      | `shop.tsx`                       | 15 min     |
| Fix `pt-[80px]` to be dynamic                        | `__root.tsx`, `styles.css`       | 10 min     |

---

## 6. Architecture-Level Recommendations

### Theme System Upgrade

Migrate to a single source of truth for colors:

```css
/* styles.css — already has the tokens, just need to USE them */
.text-ink     → text-[var(--color-ink)]
.bg-surface   → background-color: var(--color-surface)
.border-hairline → border-color: var(--color-hairline)
.text-concrete  → color: var(--color-concrete)
```

Then wire shadcn's CSS variables to your custom palette so all `ui/*` components pick up the same design language:

```css
:root {
  --primary: var(--color-ink);
  --primary-foreground: var(--color-paper);
  --secondary: var(--color-surface);
  --border: var(--color-hairline);
  --muted-foreground: var(--color-concrete);
  --ring: var(--color-ink);
}
```

### Component Audit: shadcn Replacements Available

| Custom Component | shadcn Replacement | Already Installed?       |
| ---------------- | ------------------ | ------------------------ |
| `FilterDropdown` | `Select`           | ✅ Yes (`ui/select.tsx`) |
| Cart Drawer      | `Sheet`            | ✅ Yes (`ui/sheet.tsx`)  |
| Zoom Lightbox    | `Dialog`           | ✅ Yes (`ui/dialog.tsx`) |
| Newsletter input | `Input`            | ✅ Yes (`ui/input.tsx`)  |
| All buttons      | `Button`           | ✅ Yes (`ui/button.tsx`) |
| Status badges    | `Badge`            | ✅ Yes (`ui/badge.tsx`)  |

**Note:** Replacing cart drawer or zoom lightbox with shadcn versions is not strictly necessary — they work fine. But using them would give you consistent focus management, keyboard handling, and a11y patterns out of the box.

---

## Summary

The site has a strong design foundation: a clear monochrome aesthetic, consistent typographic voice, and a well-structured Tailwind v4 + CSS variable theme. The primary areas for improvement are:

1. **Bridge the gap between your token system and the actual component code** — your CSS variables are well-defined but components don't reference them.
2. **Add micro-interactions and transitions** — the UI is functionally complete but feels static. Staggered reveals, image loading animations, and cart feedback would elevate perceived quality significantly.
3. **Fix accessibility anti-patterns** — button-inside-link, missing focus trap, no skip-to-content.
4. **Leverage the shadcn components you've already installed** — `Button`, `Select`, `Sheet`, `Dialog`, `Input` are ready to use and would replace custom implementations with battle-tested, accessible components.
5. **Unify navigation** — remove either `Navigation.tsx` or `PillNav.tsx` to eliminate duplication.
