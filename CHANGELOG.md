# Changelog

Developer-facing change log. **Updated on every push** — after you `git pull`, read the
newest entry (top) to see what changed, why, and anything you must do locally
(migrations, env, new files). Newest first.

---

## 2026-06-18 — Stability, full audit fixes, client-hub features, admin UI overhaul

### ⚠️ Dev notes — do this after pulling
- **DB migrations are automatic.** `lib/db.ts → initDB()` runs idempotent `CREATE/ALTER`
  on app startup. New this release: extra `site_settings` keys and a new
  `canvas_invoices.client_id` column (+ index). Your local DB self-migrates on first
  run — **no manual SQL needed.**
- **No new npm dependencies** (`react-hot-toast` was already in package.json). Still run
  `npm install` if your tree is stale, then `npm run dev`.
- **Env:** `.env.local` still needs `MYSQL_*`, `NEXTAUTH_SECRET` (≥32 chars),
  `NEXTAUTH_URL`, `CLIENT_JWT_SECRET` (≥32). **Changed:** analytics IDs and the Google
  Maps key are now managed in **Admin → Site Settings → Integrations** (stored in DB),
  not hardcoded. `GOOGLE_MAPS_API_KEY` env still works as a fallback. Analytics
  (GTM + Meta Pixel) is **OFF by default** and only loads when enabled in the dashboard.
- **New files:** `components/Analytics.tsx`, `components/ui/StatusBadge.tsx`,
  `components/ui/ConfirmDialog.tsx`, `lib/settings.ts`,
  `app/api/admin/clients/[id]/invoices/route.ts`.

### Added (features)
- **Invoices now link to clients** (client-hub): `canvas_invoices.client_id` column; a
  "Link to Client" selector in the GST invoice builder (prefills empty billing fields);
  an **Invoices** section on the client profile listing *all* of a client's invoices
  (GST-builder + order-generated); new `GET /api/admin/clients/[id]/invoices`.
- **Order → invoice controls**: "Generate Invoice" + "View / Print" on the order panel;
  "Mark Paid" now works (added `PATCH /api/admin/orders/[id]/invoice`).
- **Order item lifecycle + add-ons UI** (per item: add add-ons, log install/service/
  repair/replace/retire events) — wires the previously-unused `/items/[itemId]/addons`
  and `/items/[itemId]/lifecycle` endpoints.
- **Inquiry → "Convert to Client"** button (general + product inquiry forms); reuses
  `POST /api/admin/clients` with `source_inquiry_id`/`source_inquiry_type` (sets
  `client_id` server-side, copies quote products).
- **Restored admin nav:** Enterprise Leads (`/admin/enterprise`) and Team Members
  (`/admin/team-members`) were built but missing from the sidebar — leads were
  accumulating unreachable.
- **Admin → Site Settings → Integrations** tab: analytics on/off toggle, GTM ID,
  Meta Pixel ID, Google Maps API key.

### Fixed (bugs)
- **Blank page for `prefers-reduced-motion` users** — the whole site (public + admin)
  rendered invisible because `PageTransition` left `opacity:0` and the reduced-motion
  branch never animated it back. `globals.css` now forces the page shell visible under
  reduced motion.
- **Middleware redirects went to `localhost:3003` behind the reverse proxy** — now built
  from `NEXTAUTH_URL` (also closes an open-redirect / `X-Forwarded-Host` injection).
- **Case Studies admin list crashed** when a study had GPS coords (`mysql2` returns
  `DECIMAL` as a string → `.toFixed()` on a string). Fixed with `Number()`.
- Analytics `?days=`/`?limit=` with non-numeric input caused a 500 (NaN into SQL) — now
  validated/clamped.
- `products` / `client products` `JSON.parse` now guarded per-row; client catalog search
  null-guarded (one bad row no longer 500s the list).
- AMC renewal could create a duplicate active AMC if the "mark renewed" call failed —
  now checks success first.
- Admin Site-Settings save was UPDATE-only (silently dropped not-yet-seeded keys) — now
  an upsert.
- Contact page mojibake ("Contact Us â€“…", "Sendingâ€¦") fixed.
- Analytics (GTM/Meta Pixel) was hardcoded and always on (incl. staging) — now
  dashboard-gated and off by default. Google Maps key moved to DB and **excluded** from
  the public `/api/site-settings` response (no key leak).

### Changed (design / UX / accessibility — ~35 admin files)
- **One color system:** 689 hardcoded `blue-*` classes swapped to the `brand-*` palette
  (exposed as Tailwind utilities via `@theme` in `globals.css`) so admin matches the
  public site.
- **Toasts actually work:** `<Toaster/>` is now mounted once in the admin layout (it was
  per-page on only 5 pages, so ~15 pages fired toasts into the void). Removed redundant
  per-page `<Toaster/>`; silent `catch` blocks now surface `toast.error(...)`.
- **Accessibility:** form `<label htmlFor>`/control `id` association; `aria-current` on
  the active sidebar item; `aria-expanded` on category toggles; hover-only row actions
  made keyboard/touch reachable (`group-focus-within`); low-contrast 10px text bumped;
  icon-button `aria-label`s.
- Adopted `ConfirmDialog` for ~6 delete flows and `StatusBadge` where straightforward.

### Notes / decisions
- Invoice systems kept as two tables (`canvas_invoices` = GST builder, `admin_invoices`
  = order-bound) but **interlinked through the client** — the client profile shows both.
- Some `window.confirm()` calls were intentionally left where swapping to `ConfirmDialog`
  was risky; `app/admin/inquiries/page.tsx` keeps its own custom toast (its state var
  name shadows `react-hot-toast`).
