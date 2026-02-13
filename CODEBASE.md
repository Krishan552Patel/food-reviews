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
