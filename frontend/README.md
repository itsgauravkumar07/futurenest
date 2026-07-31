# FutureNest Frontend — Foundation (Next.js + TypeScript)

## Setup

```
npm install
cp .env.local.example .env.local
```
Edit `.env.local` if your backend isn't running on `http://localhost:5000`.

Make sure the backend is running (see the `futurenest-backend` project),
then:
```
npm run dev
```
Visit `http://localhost:3000`.

## Design system

Defined in `tailwind.config.ts` and `src/app/globals.css`:

- **Colors**: `ink` (deep navy, brand/trust), `paper` (warm off-white background), `accent` (ochre/gold — property warmth), `slate` (secondary text), `leaf`/`brick`/`amber` (approved/rejected/pending status colors), `line` (hairline dividers)
- **Type**: Fraunces (display serif, headings), Inter (body), IBM Plex Mono (prices, labels, step numbers)
- **Reusable classes**: `.btn-primary` / `.btn-accent` / `.btn-outline` / `.btn-ghost`, `.card`, `.input`, `.label`, `.pill-*` (status pills), `.eyebrow` (small caps section labels), `.container-page` (page width wrapper)

Use these existing classes/tokens for every new page rather than
introducing new colors or one-off styles — that's what keeps the whole
site feeling designed, not assembled page-by-page.

## What's built so far

- **Project foundation**: Next.js 14 App Router, TypeScript, Tailwind, folder structure
- **`src/types/index.ts`**: TypeScript types mirroring every backend model (User, Property, Lead, Plan, PlanPurchase, BuyerRequest, Blog)
- **`src/lib/api.ts`**: Axios client for authenticated client-side calls, auto-attaches JWT from `localStorage`, clears it on a 401
- **`src/lib/server-api.ts`**: Server-side fetch helpers for public data (properties, blogs, plans) — used by server components, fails gracefully to empty results if the backend is unreachable
- **`src/lib/auth-context.tsx`**: `AuthProvider` + `useAuth()` hook — login, register, logout, session restore on page load
- **`src/lib/utils.ts`**: price/date formatting helpers
- **Layout**: `Navbar` (auth-aware, shows dashboard link + logout when logged in) and `Footer`

### Public pages (all built)

| Route | What it does |
|---|---|
| `/` | Hero, quick search, real 4-step lead pipeline, differentiators, live featured properties + seller plans |
| `/properties` | Search/filter grid (keyword, sale/rent, property type, city, price range), plain GET-form filters (no client JS needed), pagination |
| `/properties/:id` | Full detail view, image, specs, description, **"I'm Interested" button** wired to the real leads API — redirects to register/login if logged out, blocks non-buyers, shows success/error state |
| `/blog` | Published posts grid with search |
| `/blog/:slug` | Full post view, renders HTML content (from a future rich-text editor) with typography styles, tags |
| `/login`, `/register` | Auth forms; register toggles buyer/seller and supports a `?role=` default; both support `?redirect=` to bounce back to where the user came from (used by the Interested button) |
| `/about` | Static page explaining the lead-gen (not listing-site) model |
| `/contact` | Contact info + a form that hands off to a `mailto:` link (no backend contact endpoint exists yet — this is a placeholder until one's built) |

## Not built yet (next passes)

Nothing from the original scope — all four dashboards are built. Possible future additions:
- Real image upload (Cloudinary) — property/blog images currently take a plain URL, since Cloudinary isn't wired up yet
- Rich-text editor for blog content — currently a raw HTML textarea
- A proper property picker UI for admin "match" actions on buyer requests — currently a comma-separated ID prompt
- A real backend endpoint for the Contact page (currently hands off to `mailto:`)
- Pagination on admin/dashboard list views (currently show full unpaginated lists — fine for early usage, worth adding as data grows)

## Dashboards (all four roles)

All dashboard pages are client components (`"use client"`) since they rely on
the JWT stored in `localStorage` via the axios `api` client — unlike the
public pages, which fetch server-side with plain `fetch`.

Each dashboard has its own `layout.tsx` that calls `useProtectedRoute([...allowedRoles])`
— this redirects to `/login` if logged out, or to `/` if logged in as the
wrong role, before rendering any of that dashboard's pages.

### `/dashboard/seller`
| Page | What it does |
|---|---|
| Overview | Plan status card (listings/leads remaining, expiry), quick counts |
| Properties | List own properties (any status), edit, delete |
| Properties → Add / Edit | Shared `PropertyForm` — editing sends it back to "pending" (matches backend behavior) |
| Plans | Browse seller plans, purchase (offline payment), purchase history, request a refund |

### `/dashboard/buyer`
| Page | What it does |
|---|---|
| Overview | Quick counts, assisted-search balance if active |
| My Interests | Leads raised via "I'm Interested", with status |
| Assisted Search | Submit requirements, view status, see matched properties once admin shares them |
| Plans | Browse buyer/tenant assisted-search plans, purchase, history, refund |

### `/dashboard/admin` (also accessible to superadmin)
| Page | What it does |
|---|---|
| Overview | Counts needing action across properties/leads/plans/requests |
| Properties | Tabs by status, approve/reject with reason |
| Leads | Tabs by status, full contact → qualify → share → disqualify workflow |
| Plan Purchases | Tabs: pending activation (activate/cancel), refund requests (approve/reject) |
| Buyer Requests | Tabs by status, start sourcing → share matches (paste property IDs) → close |
| Blog | List/create/edit/delete, publish/unpublish |

### `/dashboard/superadmin`
| Page | What it does |
|---|---|
| Overview | Revenue, plan count, admin count, link into the Admin dashboard for day-to-day ops |
| Plans | List all (incl. retired), create/edit, retire/reactivate — supports both seller and buyer/tenant audience plans |
| Admins | List + create new Admin accounts (the API-based replacement for hand-editing Atlas) |
| Users | Search/filter any account by role, activate/deactivate |
| Revenue | Total revenue, split by audience (seller vs buyer plans) and by individual plan |

## Changelog — bug fixes & new features (this batch)

- **Fixed**: property/blog images from any external host no longer crash the app (`next/image` hostname restriction widened).
- **Fixed**: redirect after login/register now goes straight to the user's own dashboard (by role), instead of the homepage — unless a `?redirect=` param is present (e.g. the "I'm Interested" flow), which still takes priority.
- **Fixed**: refund rejection/approval reason is now shown to the seller/buyer on their Plans page, not just recorded silently.
- **New**: Dashboard pages no longer show the public site's Navbar/Footer — each dashboard has its own top bar (`DashboardTopbar`) showing the user's name and a logout button, top-right.
- **New**: Real image upload — `ImageUpload` component, wired into the property listing form (multi-photo) and blog cover image. Requires the backend's Cloudinary setup.
- **New**: Plan purchase now shows the actual payment flow — QR code, UPI ID (copyable), and a screenshot upload — instead of just a disabled "pending" button. See `PendingPurchaseCard` in both the seller and buyer Plans pages.
- **New**: Super Admin's Plan form has QR code upload + UPI ID fields, and `validityDays` is now optional (leave blank for a plan that never expires).
- **New**: Super Admin's Revenue page lists individual purchasers, not just totals.

### Known rough edges (functional, but worth knowing)
- **No image upload yet** — property/blog cover images take a plain URL field. Wire up Cloudinary when ready.
- **Editing a property or blog post** fetches the full list and filters client-side to find the one being edited, since the backend doesn't have single-item "get my own by ID" endpoints yet. Fine at current scale; worth adding real endpoints if lists grow large.
- **Admin "Share Matches"** on a buyer request uses a plain prompt for comma-separated property IDs — a real property-picker UI would be a nice upgrade.
- **Blog content is raw HTML** in a textarea — no rich-text editor wired up yet.

Ask Claude to continue with any of the rough edges above, or new features, when you're ready.
