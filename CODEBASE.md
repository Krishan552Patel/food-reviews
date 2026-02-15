# FoodReviews — Codebase Changelog

> This file tracks all changes made to the project. Read this file first to understand what has been modified.

---

## Change Log

### 1. Hero Section Simplified (Feb 13, 2026)

**File:** `src/app/page.tsx`

**What changed:**
- Removed the old hero title: "Honest reviews, real experiences"
- Removed the subtitle: "Restaurants, bubble tea, and cafes — reviewed dish by dish with food, service, and price ratings."
- Removed the stats section (Reviews count, 3 Categories, 5 Star Scale)
- Replaced everything with a single title: **"Friends recommendation"**

**Before:**
```tsx
<h1>Honest reviews, <span>real experiences</span></h1>
<p>Restaurants, bubble tea, and cafes — reviewed dish by dish...</p>
<div>Stats: {count} Reviews | 3 Categories | 5 Star Scale</div>
```

**After:**
```tsx
<h1>Friends <span className="gradient-text">recommendation</span></h1>
```

The hero section still retains its gradient background, pattern overlay, and bottom fade — only the inner content was simplified.

---

### 2. Enhanced Page Filtering (Feb 13, 2026)

**Files:** `src/components/FilterBar.tsx`, `src/app/page.tsx`, `src/lib/constants.ts`

**What changed:**
- **FilterBar** now supports 3 filter dimensions:
  1. **Category** — All, Restaurants, Bubble Tea, Cafes (unchanged logic, now with label)
  2. **Cuisine Type** — dynamically populated from the database (e.g. Japanese, Italian). Only appears if cuisine types exist in data.
  3. **Rating** — Any Rating, 3+ ★, 4+ ★, 5 ★
- FilterBar now accepts a `cuisineTypes: string[]` prop passed from the server.
- Each filter section has a small uppercase label above the pills.
- All filter state is managed via URL search params: `?categories=...&cuisine=...&rating=...`

- **Home page (`page.tsx`)** now:
  - Parses `cuisine` and `rating` search params in addition to `categories`
  - Applies `.ilike("cuisine_type", cuisine)` and `.gte("rating", minRating)` to the Supabase query
  - Fetches distinct `cuisine_type` values to pass to FilterBar
  - Uses `hasFilters` boolean for the "Clear filters" button (was previously only checking `categories`)

- **Constants (`constants.ts`)** — Added `RATING_OPTIONS` array: `[{value: 0, label: "Any Rating"}, {value: 3, label: "3+ ★"}, ...]`

**Admin form already had:**
- Category dropdown (Restaurant / Bubble Tea / Cafe) — confirmed present in `RestaurantForm.tsx`
- Cuisine type text input — confirmed present

---

### 3. Full Color Scheme Overhaul — Navy #020361 (Feb 13, 2026)

**Files changed:**
- `src/app/globals.css` — All CSS custom properties
- `src/app/page.tsx` — Hero gradient, pattern overlay, shadow
- `src/app/not-found.tsx` — Button color
- `src/app/restaurant/[slug]/page.tsx` — Category badges, text colors, dish card backgrounds
- `src/app/admin/page.tsx` — Spinner, login form, buttons, star colors, links
- `src/app/admin/edit/[id]/page.tsx` — Spinner, link colors
- `src/app/admin/dishes/edit/[id]/page.tsx` — Spinner, link colors
- `src/components/FilterBar.tsx` — Active pill shadow
- `src/components/StarRating.tsx` — Star filled/unfilled colors
- `src/components/RestaurantCard.tsx` — Category badge colors, placeholder background
- `src/components/MapView.tsx` — Marker colors, popup heading/stars/link colors
- `src/components/MapDynamic.tsx` — Loading background
- `src/components/ImageGallery.tsx` — Placeholder background
- `src/components/DishRatingBar.tsx` — Label color, track background
- `src/components/admin/StarPicker.tsx` — Filled/unfilled colors
- `src/components/admin/RestaurantForm.tsx` — Input focus, file upload, submit button
- `src/components/admin/DishManager.tsx` — Input focus, buttons, links, file upload, image ring
- `src/components/admin/DishReviewForm.tsx` — Input focus, image ring, file upload, submit button

**What changed:**
Replaced the entire warm orange (#e85d26) color scheme with a deep navy palette:

| Role | Old Value | New Value |
|---|---|---|
| Primary accent | `#e85d26` (orange) | `#020361` (deep navy) |
| Accent light | `#f59e0b` (amber) | `#2d4de0` (bright blue) |
| Accent dark | — | `#010240` (darker navy) |
| Button hover | `orange-700` | `#0a0c6e` |
| Stars filled | `#f59e0b` (amber) | `#6366f1` (indigo) |
| Stars unfilled | `#e7e1da` | `#d4d6e4` (cool gray) |
| Background | warm stone tones | cool slate/indigo tones |
| Category: restaurant | orange | navy `#020361` |
| Category: bubble_tea | green | teal `#14b8a6` |
| Category: cafe | amber | indigo `#6366f1` |

All Tailwind classes updated from `orange-*` / `stone-*` to `indigo-*` / `slate-*` variants.

---

## Project Overview (for re-prompting context)

- **Framework:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Database:** Supabase (Postgres + Storage)
- **Maps:** MapLibre GL with OpenStreetMap tiles
- **Auth:** Password-based admin with HMAC-SHA256 token cookie

### Key Files
| File | Purpose |
|---|---|
| `src/app/page.tsx` | Home page — hero + filterable restaurant grid |
| `src/app/restaurant/[slug]/page.tsx` | Restaurant detail page with dishes, ratings, map |
| `src/app/map/page.tsx` | Full-screen map of all restaurants |
| `src/app/admin/page.tsx` | Admin dashboard (login + restaurant CRUD) |
| `src/components/` | Shared UI components (Navbar, Footer, FilterBar, RestaurantCard, StarRating, etc.) |
| `src/lib/types.ts` | TypeScript interfaces (Restaurant, Dish) |
| `src/lib/constants.ts` | Category options, storage URL, map defaults |
| `src/lib/admin-auth.ts` | Password verify, token create/verify |
| `src/lib/supabase/` | Supabase clients (browser, server, admin) |
| `src/app/api/admin/` | API routes for restaurants, dishes, upload, login/logout |
| `src/middleware.ts` | Auth guard for admin routes |
| `src/app/globals.css` | CSS variables, animations, component styles |
