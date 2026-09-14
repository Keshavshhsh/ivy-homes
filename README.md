# Ivy Homes — Software Engineering Internship Assignment
**Candidate:** Keshav Kumar (MNNIT Allahabad · `20233158@mnnit.ac.in`)  
**City:** Bangalore · **Assigned Locality:** Whitefield  
**API Key:** `IVY26-DC1469CB99F9` · **Reference Moment:** `2026-09-10T00:00:00+05:30 IST`

---

## 1. Overview & Architecture

This repository contains a full-stack real estate discovery and data audit application built on top of the Ivy Homes Property API (`https://solve.ivy.homes`).

The project delivers:
1. **`submission.json`**: Answers to all 10 problem statements plus 20 verified discrepancies with supporting evidence IDs.
2. **Production React Frontend**: A responsive, modern web app built with React 19, Vite, and Tailwind CSS v4 supporting all 6 assignment requirements:
   - Multi-account auth (`demo1@ivy.homes`, `demo2`, `demo3` with password `d7676b417d`)
   - Resilient silent token auto-refresh surviving well beyond the 15-minute token lifespan (> 30 minutes)
   - Resilient browse listings with client-side fallback filtering (locality, BHK, price range, furnishing, live status)
   - Direct-linkable listing detail pages (`#listing-:id`) with client-side similar listings
   - Saved listings management connected to `POST/GET/DELETE /v1/saved` with per-user isolation
   - Browsable rentals and projects with normalized INR prices and square-footage areas
   - An Insights & Audit screen exposing real estate metrics and the 20 documentation discrepancies

---

## 2. How to Run

### Prerequisites
- Node.js (v18 or higher, tested on Node v24.12.0)
- npm (tested on npm 11.0.0)

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```
Open your browser at `http://localhost:3000` (or the port indicated in your terminal).

### Production Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 3. How We Worked Out Which Parts of Documentation to Distrust

Rather than reading records one by one, we retrieved 100% of the raw data (4,700 sale listings, 1,900 rentals, and 520 builder projects) using an automated crawling pipeline and compared documented claims against empirical reality.

### 1. Authentication & Session Lifespan
- **Documented:** Documentation claimed that `api_key` must be appended as a query parameter (`?api_key=...`), that login returns `"token"`, that tokens last 24 hours (86,400s), and that *"there is no refresh flow."*
- **Observed Reality:**
  - Sending `?api_key=...` returned `401: send your key in the X-API-Key request header, not as a query parameter`.
  - `POST /auth/login` actually returns `access_token`, `refresh_token`, `expires_in: 900` (15 minutes), and `refresh_url: /auth/refresh`.
  - An undocumented endpoint `POST /auth/refresh` exists and functions cleanly.
  - `POST /auth/logout` returned `{"ok": true, "note": "tokens are stateless; discard them client side"}`.
- **Action Taken:**
  - We implemented an API client interceptor sending both `X-API-Key` and `Authorization: Bearer <access_token>`.
  - We built a background refresh scheduler in `AuthContext` that silently requests a fresh token pair every 14 minutes, allowing users to remain logged in indefinitely across page refreshes.

### 2. Pagination & Truncation
- **Documented:** Documented pagination claimed endpoints accept `page` (1-indexed) and `limit` (up to 200), and that `total` represents the exact record count.
- **Observed Reality:**
  - `page` is quietly ignored by the backend; pagination uses `offset` (0-indexed).
  - `limit` is strictly capped at 50 (requesting 200 returns 50).
  - Response metadata contains `has_more` and `offset`, omitting `page_size`.
  - The reported `total` field on `/v1/listings` claims `4348`, but following `has_more: true` continued yielding records up to offset 4,700.
- **Action Taken:**
  - The crawler and frontend paginate strictly by `offset` and rely on `has_more` instead of stopping at the reported `total`.

### 3. Inactive Listings & Missing Server Filters
- **Documented:** Docs claimed `/v1/listings` only returns active sale listings and that inactive/expired listings are filtered out server-side.
- **Observed Reality:** 978 records out of 4,700 have `is_live: false`. Furthermore, passing `project_id=...` or `is_live=true` as query parameters to `/v1/listings` does not filter the results on the server.
- **Action Taken:**
  - The frontend implements a client-side filter engine with an active-only toggle (enabled by default) to protect end users from viewing stale or withdrawn properties.

### 4. MagicHomes Area Unit Inconsistency
- **Documented:** Area is square feet, integer, everywhere in the API.
- **Observed Reality:** Listings sourced from MagicHomes (`website == 'magichomes'`) reported carpet areas between 35 and 200 for 1-4 BHK units, whereas all other portals reported 400 to 2,500 sqft. Computing price/carpet for MagicHomes without adjustment yielded an absurd ~₹150,000/sqft. MagicHomes was reporting area in **square meters (sqm)**.
- **Action Taken:**
  - We normalized all MagicHomes carpet and super built-up areas by multiplying by `10.7639`. This brought the mean Bangalore 2BHK price/sqft to ₹11,496.64.

### 5. Project Pricing Inconsistency
- **Documented:** `price_min` and `price_max` are integer rupees.
- **Observed Reality:** Across all 520 builder projects, prices are floating-point values between 1.0 and 99.8. Values < 10 represent **Crores** (e.g. 1.04 Cr, 4.89 Cr), while values >= 10 represent **Lakhs** (e.g. 38.9 L, 99.8 L).
- **Action Taken:**
  - Built a unit normalization pipeline converting project prices into standardized INR integers and user-friendly "₹ Cr" and "₹ L" displays.

### 6. Endpoint Paths & Favourites
- **Documented:** `GET /v1/listing/{id}`, `GET /v1/listings/{id}/similar`, `GET/POST/DELETE /v1/favourites`, `GET /v1/analytics/summary`.
- **Observed Reality:**
  - `GET /v1/listing/{id}` returns 404 (actual path is plural `GET /v1/listings/{id}`).
  - `GET /v1/listings/{id}/similar` returns 404.
  - `/v1/favourites` returns 404; the real endpoint is `/v1/saved` and accepts `{"listing_id": "..."}` rather than `{"id": "..."}`.
  - `/v1/analytics/summary` returns 404.
- **Action Taken:**
  - Used `/v1/saved` for user favorites.
  - Implemented client-side similar listings recommendation (same locality, same BHK, ±25% price).
  - Built our own Analytics & Insights engine directly from retrievable records.

---

## 4. What We Checked That Turned Out to Be Fine (Negative Hypotheses)

In investigating the dataset, we tested several hypotheses that did **not** pan out:

1. **Hypothesis: Rental prices or maintenance might be in thousands or wrong units.**
   - *Test:* We analyzed min, max, and distributions for monthly rent, security deposit, and maintenance across all 1,900 rentals.
   - *Result:* Completely standard and realistic across all localities (rents ranged from ₹10,000 to ₹86,800; maintenance between ₹1,000 and ₹5,000; deposit between 5x and 10x rent). No unit corruption was present in rentals.

2. **Hypothesis: Negative or missing bedroom/bathroom counts in plots might be data corruption.**
   - *Test:* We checked all 190 listings with `bedroom == 0`.
   - *Result:* 182 of them had `property_type == 'plot'`, where 0 bedrooms, 0 bathrooms, and 0 floors are valid real-world representations of vacant land. Only non-plot properties with structural impossibilities were classified as corrupt.

3. **Hypothesis: Timestamps in listings might be UTC that needed offset adjustment.**
   - *Test:* We compared timestamps against server time in `/health` (`Asia/Kolkata` with explicit `+05:30` offset).
   - *Result:* The timestamps in the database were already stored in local IST time (e.g. daily posting spikes aligned with daytime IST business hours, with zero posts during local midnight hours). Converting them as UTC would have shifted posts across midnight improperly.

4. **Hypothesis: Project RERA numbers or launch dates might contain invalid formats or future possession dates beyond 2035.**
   - *Test:* Regex-validated all RERA registrations (`PRM/KA/RERA/...`) and parsed all `launch_date` and `possession_date` fields.
   - *Result:* All 520 projects carry valid Karnataka RERA numbers and chronological launch/possession date windows (2020 to 2030).

5. **Hypothesis: Duplicate listing descriptions might indicate copy-paste bot accounts.**
   - *Test:* Grouped listings by exact text match on `description`.
   - *Result:* Zero exact description duplicates existed. Even cross-posted listings of the exact same property had unique, distinct descriptions written by different agents or owners.

---

## 5. Summary of the Ten Answers

| # | Key in `answers` | Value | Notes |
|---|---|---|---|
| 1 | `total_listing_records` | `4700` | Exact retrievable count after paging all the way to `has_more: false`. |
| 2 | `unique_properties` | `4583` | 117 multi-listing duplicate pairs deduplicated by physical attributes. |
| 3 | `active_listings` | `3722` | Count of records with `is_live: true`. |
| 4 | `corrupt_listing_ids` | `32 listings` | 8 floor > total, 8 carpet > super, 8 lat/lng swapped, 8 negative price. |
| 5 | `total_monthly_rent` | `7158600` | Sum of monthly rent across all 206 rentals in Whitefield. |
| 6 | `avg_price_per_sqft_2bhk` | `11496.64` | Live 2BHKs, excluding Q4/Q9, with MagicHomes converted sqm to sqft. |
| 7 | `costliest_project` | `{"project_id": "P10255", "price_max_inr": 48900000}` | Puravankara Vista (4.89 Crores = ₹48,900,000). |
| 8 | `listings_last_7_days` | `149` | Listings posted in `[2026-09-03T00:00:00, 2026-09-10T00:00:00)` IST. |
| 9 | `fake_listing_ids` | `8 listings` | 8 listings with enquiry-bait sale prices under ₹17,000. |
| 10 | `projects_with_wrong_listing_count` | `127` | Projects whose reported `total_listings` desynced from active listings. |

---

## 6. What We Would Do With Another Two Days

1. **Interactive Geospatial Map (Leaflet / Mapbox GL):**
   - Render all Bangalore listings and projects as interactive clustered pins on a map.
   - Add polygon boundary overlays for the 10 Bangalore localities (Whitefield, Indiranagar, HSR Layout, Koramangala, etc.).
   - Visual indicator highlighting the 8 swapped-coordinate listings alongside a one-click "auto-fix coordinates" preview.

2. **Automated Cross-Portal De-Duplication Engine:**
   - Implement an automated fuzzy deduplication algorithm using address normalization, floor matching, and image hashing to cluster duplicate listings across 100acres, MagicHomes, ZeroBroker, Dwelling, and SquareLane into a single unified property card showing all broker offers side by side.

3. **Machine Learning Price Estimation & Anomaly Score:**
   - Train a lightweight client-side regression model predicting expected price per sqft based on locality, BHK, amenities, and floor.
   - Automatically score every new listing with a "Fair Price Index" and automatically flag enquiry-bait and corrupt records before human review.

4. **Offline PWA & Background Sync:**
   - Add Service Worker caching and background sync so users can browse, save, and compare homes completely offline with instant sync upon reconnection.

---

## 7. LLM & Tools Attribution

In compliance with assignment guidelines:
- Developed with the assistance of **Google Antigravity (Gemini 3.8)**.
- Tools used: Python 3.14 for dataset crawling and statistical validation, React 19, Vite, Tailwind CSS v4, Lucide React, and Git.
