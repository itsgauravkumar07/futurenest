# FutureNest Backend — Phase 1 (Foundation)

This is the first build phase: server skeleton, MongoDB connection, core
data models, and JWT authentication with role-based access control.

## What's included

- `server.js` — Express app entry point
- `config/db.js` — MongoDB Atlas connection
- `models/` — User, Property, Plan, Lead, Blog schemas
- `middleware/auth.js` — `protect` (JWT verification) and `requireRole` (role gating)
- `controllers/authController.js` + `routes/authRoutes.js` — register / login / me

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
3. Run in dev mode:
   ```
   npm run dev
   ```
4. Test it's alive:
   ```
   GET http://localhost:5000/api/health
   ```

## Endpoints so far

| Method | Route             | Access        | Description               |
|--------|--------------------|---------------|----------------------------|
| POST   | /api/auth/register | Public        | Register as buyer or seller |
| POST   | /api/auth/login    | Public        | Login, returns JWT          |
| GET    | /api/auth/me        | Authenticated | Returns current user        |

Admin and Super Admin accounts are NOT created through public registration —
seed them directly in MongoDB (or write a one-off seed script) since only
buyers and sellers should be able to self-register.

## Using `requireRole` in future routes

```js
const { protect, requireRole } = require("../middleware/auth");

// Only admins and superadmins can approve properties
router.put("/:id/approve", protect, requireRole("admin", "superadmin"), approveProperty);
```

## Phase 2 — Property CRUD + Approval Workflow

### Seller endpoints (require `Authorization: Bearer <token>`, role: seller)

| Method | Route                  | Description                                      |
|--------|------------------------|---------------------------------------------------|
| POST   | /api/properties        | Create a property (goes in as "pending")           |
| GET    | /api/properties/mine/all | List all of the seller's own properties (any status) |
| PUT    | /api/properties/:id    | Edit own property (sends it back to "pending")     |
| DELETE | /api/properties/:id    | Delete own property                                |

### Public endpoints (no auth)

| Method | Route                | Description                                    |
|--------|------------------------|-----------------------------------------------|
| GET    | /api/properties        | Browse/search approved+published properties (query params: `listingType`, `propertyType`, `city`, `minPrice`, `maxPrice`, `search`, `page`, `limit`) |
| GET    | /api/properties/:id    | View a single approved+published property       |

### Admin endpoints (require role: admin or superadmin)

| Method | Route                              | Description                  |
|--------|--------------------------------------|-------------------------------|
| GET    | /api/admin/properties/pending        | List properties awaiting review |
| GET    | /api/admin/properties?status=approved | List all properties, optional status filter |
| PUT    | /api/admin/properties/:id/approve    | Approve + publish a property   |
| PUT    | /api/admin/properties/:id/reject     | Reject a property (body: `{ "reason": "..." }`) |

### ⚠️ Testing this phase before Phase 4 (Plans) is built

Property creation is gated on the seller having an **active plan** with
`listingsRemaining > 0` (this enforces the "Listing Limit" from your seller
plans). Since plan purchase/activation isn't built until Phase 4, you'll
need to manually set these fields on a test seller user directly in
MongoDB Atlas (via Compass or the Atlas web UI) to test property creation
right now:

```json
{
  "planStatus": "active",
  "listingsRemaining": 5,
  "planExpiryDate": "2026-12-31T00:00:00.000Z"
}
```

## Phase 3 — Buyer Interest & Lead Qualification Workflow

### Buyer endpoints (require `Authorization: Bearer <token>`, role: buyer)

| Method | Route         | Description                                          |
|--------|---------------|-------------------------------------------------------|
| POST   | /api/leads    | Raise interest on a property (body: `{ "propertyId": "..." }`) |
| GET    | /api/leads/mine | View leads you've raised, with property details      |

A buyer can't raise duplicate interest on the same property — trying again
returns their existing lead instead of creating a new one, unless that
earlier lead was disqualified.

### Admin endpoints (require role: admin or superadmin)

| Method | Route                          | Description                              |
|--------|----------------------------------|--------------------------------------------|
| GET    | /api/admin/leads?status=new      | List leads, optional status filter          |
| PUT    | /api/admin/leads/:id/contact      | Mark that the buyer has been contacted      |
| PUT    | /api/admin/leads/:id/qualify      | Confirm genuine interest — **this is the only step that reduces the seller's `leadsRemaining`** |
| PUT    | /api/admin/leads/:id/share        | Mark that lead details were shared offline with the seller (only from "qualified") |
| PUT    | /api/admin/leads/:id/disqualify   | Buyer unreachable/not genuine — does NOT touch the seller's balance |

### Lead status flow
```
new → contacted → qualified → shared
                 ↘ disqualified (from new or contacted, never after shared)
```

### Testing this phase in Postman

1. Register/login as a **buyer**, save token as `buyerToken`.
2. `GET {{baseUrl}}/properties` (public) — copy the `_id` of an approved property.
3. `POST {{baseUrl}}/leads` with `Authorization: Bearer {{buyerToken}}` and body `{ "propertyId": "<id>" }`.
4. Try step 3 again — you should get a 409 with your existing lead, not a duplicate.
5. Switch to your `adminToken` and `GET {{baseUrl}}/admin/leads` to see it.
6. Walk it through: `PUT /admin/leads/:id/contact` → `PUT /admin/leads/:id/qualify` → `PUT /admin/leads/:id/share`.
7. Check MongoDB Atlas: the seller's `leadsRemaining` should have dropped by exactly 1, and only at the "qualify" step — not at "contact" or "share".

## Rental Support — Already Built In

Rental listings ("landlord adds a rental property, tenant finds it") were
never a separate feature to build — they've worked since Phase 2/3, because:

- `listingType: "rental"` vs `"sale"` was already in the `Property` schema
- `propertyType` is a free string, so "Flat", "PG", "Office", "Shop", "Commercial Space" all work with zero schema changes
- Seller already covers landlords, Buyer already covers tenants — per your brief, there are no separate roles
- Public browsing already filters with `?listingType=rental`
- The lead/interest flow is identical for a tenant as for a buyer

One small fix was added: `priceUnit` now auto-defaults to `"per_month"` for
rentals and `"total"` for sales if the seller doesn't explicitly set it —
prevents a rental listing accidentally showing a lump-sum price.

**Optional next step, not yet built:** rental-specific fields like
furnishing status (furnished/semi-furnished/unfurnished), available-from
date, or preferred tenant type (family/bachelor/company) — common on
Indian rental portals but not mentioned in your original brief. Ask if
you'd like these added to `Property.specs`.

## Phase 4 — Plans (Purchase → Offline Payment → Activation) + Refunds

### Public endpoints

| Method | Route      | Description                    |
|--------|------------|----------------------------------|
| GET    | /api/plans | List active plans a seller can choose from |

### Seller endpoints (require `Authorization: Bearer <token>`, role: seller)

| Method | Route                                       | Description                                   |
|--------|----------------------------------------------|-------------------------------------------------|
| POST   | /api/plans/:id/purchase                      | Request a plan (offline payment — this just records intent, doesn't grant anything yet) |
| GET    | /api/plans/my-purchases                       | View your plan purchase history                 |
| POST   | /api/plans/my-purchases/:id/refund-request    | Request a refund under the money-back guarantee (body: `{ "reason": "..." }`) |

### Super Admin endpoints (require role: superadmin)

| Method | Route                              | Description                        |
|--------|--------------------------------------|--------------------------------------|
| POST   | /api/superadmin/plans                | Create a new plan                    |
| GET    | /api/superadmin/plans                | List all plans (incl. retired ones)  |
| PUT    | /api/superadmin/plans/:id            | Edit a plan's terms                  |
| PUT    | /api/superadmin/plans/:id/toggle-active | Retire/reactivate a plan (never delete — preserves history) |
| GET    | /api/admin/plan-purchases/revenue    | Revenue report (total + breakdown by plan) |

### Admin endpoints (require role: admin or superadmin)

| Method | Route                                          | Description                              |
|--------|---------------------------------------------------|---------------------------------------------|
| GET    | /api/admin/plan-purchases?status=pending_activation | List purchases needing action              |
| PUT    | /api/admin/plan-purchases/:id/activate             | Confirm offline payment received → grants the seller their listings/leads balance |
| PUT    | /api/admin/plan-purchases/:id/cancel               | Seller never paid / declined → clears pending state |
| GET    | /api/admin/plan-purchases/refund-requests          | List pending refund requests               |
| PUT    | /api/admin/plan-purchases/:id/refund               | Approve/reject a refund (body: `{ "approve": true, "reason": "..." }`) — approving revokes the seller's balance if it's their current active plan |

### How this replaces your manual Atlas edits

You've been manually setting `planStatus`, `listingsRemaining`, etc. directly
in MongoDB Atlas to test property creation — **you don't need to do that
anymore.** The real flow is now:

1. Super Admin creates a plan: `POST /api/superadmin/plans`
   ```json
   { "name": "Individual Starter", "listingLimit": 3, "qualifiedLeadsLimit": 5, "validityDays": 15, "price": 499 }
   ```
2. Seller browses plans: `GET /api/plans`
3. Seller requests it: `POST /api/plans/<planId>/purchase` — seller's `planStatus` becomes `"pending_activation"`
4. Seller pays offline (UPI/bank/cash) — outside the API, in real life
5. Admin sees it: `GET /api/admin/plan-purchases?status=pending_activation`
6. Admin activates it: `PUT /api/admin/plan-purchases/<purchaseId>/activate` — **this is what actually sets `listingsRemaining`, `leadsRemaining`, `planStatus: "active"`, and `planExpiryDate`**
7. Now `POST /api/properties` works without any manual database edits

### Note on `activePlan`

This also fixes the `activePlan` field for good — it's now always either
`null` or a real `Plan._id`, set automatically by the purchase/activation
flow. You never need to touch it manually in Atlas again.

### Sale vs Rental plans (targetListingType)

Since sellers and landlords logically want different plans (matches your
original packages), each `Plan` now has a `targetListingType`:

- `"sale"` — only usable for sale listings (e.g. a seller-focused plan)
- `"rental"` — only usable for rental listings (e.g. a landlord-focused plan)
- `"both"` — covers either (e.g. an agent plan handling both)

This is enforced in two places:
- `GET /api/plans?listingType=rental` filters what a seller sees when choosing a plan (plans tagged `"both"` always show)
- `POST /api/properties` checks the seller's active plan's `targetListingType` against the property's `listingType` — a rental-only plan can't be used to list a sale property, and vice versa

Example: two separate plans for the same limits, one per intent:
```json
{ "name": "Seller Starter", "targetListingType": "sale", "listingLimit": 3, "qualifiedLeadsLimit": 5, "validityDays": 15, "price": 499 }
{ "name": "Landlord Starter", "targetListingType": "rental", "listingLimit": 3, "qualifiedLeadsLimit": 5, "validityDays": 15, "price": 399 }
```

## Buyer/Tenant Assisted-Search Plans

Plans now have an `audience`: `"seller"` (existing listing plans) or
`"buyer"` (paid house-hunting / assisted-search service, matching what
your original MVP called out for tenants). Same purchase → offline payment
→ admin activation flow as seller plans — just a different thing it grants.

### Plan fields (updated)
```json
{
  "name": "Tenant House Hunting",
  "audience": "buyer",
  "targetListingType": "rental",
  "qualifiedLeadsLimit": 5,
  "validityDays": 30,
  "price": 1499
}
```
`listingLimit` is only required for `audience: "seller"` plans (defaults to
0 for buyer plans, since buyers don't list properties). `qualifiedLeadsLimit`
means "qualified buyer leads delivered" for a seller plan, and "assisted
property matches delivered" for a buyer plan — same field, mirrored meaning.

### New buyer-facing endpoints

| Method | Route              | Description                                     |
|--------|---------------------|----------------------------------------------------|
| POST   | /api/buyer-requests | Submit search requirements (needs an active buyer plan with matches remaining) |
| GET    | /api/buyer-requests/mine | View your requests + matched properties        |

### New admin endpoints

| Method | Route                                  | Description                          |
|--------|------------------------------------------|-----------------------------------------|
| GET    | /api/admin/buyer-requests?status=new     | Queue of assisted-search requests        |
| PUT    | /api/admin/buyer-requests/:id/start      | Mark as actively being sourced           |
| PUT    | /api/admin/buyer-requests/:id/match      | Share curated matches (body: `{ "propertyIds": [...] }`) — **only this step consumes 1 unit of the buyer's assisted-match balance** |
| PUT    | /api/admin/buyer-requests/:id/close      | Close out the request                    |

### Plan purchasing now works for both audiences
`POST /api/plans/:id/purchase` checks that the plan's `audience` matches
the requester's role — a seller can't accidentally buy a buyer plan or
vice versa. `GET /api/plans?audience=buyer&listingType=rental` lets a
tenant browse only relevant plans.

### One breaking change to know about
`PlanPurchase.seller` was renamed to `PlanPurchase.purchasedBy`, since both
sellers and buyers can purchase plans now. If you had any purchases created
before this change, they still have the old field name in the database —
harmless for testing, but worth a mental note if you inspect old records in Atlas.

## Blog Module

### Public endpoints

| Method | Route            | Description                                              |
|--------|--------------------|-------------------------------------------------------------|
| GET    | /api/blogs         | Browse published blogs (query params: `category`, `tag`, `search`, `page`, `limit`) |
| GET    | /api/blogs/:slug   | View a single published post by its slug                    |

### Admin endpoints (require role: admin or superadmin)

| Method | Route                     | Description                                    |
|--------|----------------------------|---------------------------------------------------|
| POST   | /api/admin/blogs           | Create a blog (starts as an unpublished draft)     |
| GET    | /api/admin/blogs?status=draft | List all blogs incl. drafts (`status=draft` or `published` to filter) |
| PUT    | /api/admin/blogs/:id       | Edit a blog (slug auto-regenerates if the title changes) |
| PUT    | /api/admin/blogs/:id/publish | Publish it (sets `publishedAt`)                  |
| PUT    | /api/admin/blogs/:id/unpublish | Take it back down                              |
| DELETE | /api/admin/blogs/:id       | Delete a blog                                      |

Slugs are auto-generated from the title (e.g. "5 Tips for First-Time Buyers"
→ `5-tips-for-first-time-buyers`) and de-duplicated automatically
(`-2`, `-3`, ...) if two posts share a title.

## Super Admin: Manage Admins & Users

This closes the gap where creating an Admin required hand-editing Atlas.

### Endpoints (require role: superadmin)

| Method | Route                          | Description                                   |
|--------|-----------------------------------|---------------------------------------------------|
| POST   | /api/superadmin/admins             | Create a new Admin account directly (admins can't self-register) |
| GET    | /api/superadmin/admins             | List all admin + superadmin accounts               |
| GET    | /api/superadmin/users?role=seller&search=... | List/search all users, any role, with pagination |
| PUT    | /api/superadmin/users/:id/status   | Activate/deactivate any account (body: `{ "isActive": false }`) — a super admin can't deactivate themselves this way |

### Bootstrapping your very first Super Admin

You no longer need to hand-edit a role in Atlas for this either:

```
npm run seed:superadmin
```

This reads `SEED_SUPERADMIN_NAME` / `SEED_SUPERADMIN_EMAIL` /
`SEED_SUPERADMIN_PASSWORD` from your `.env` file and either creates that
account as a superadmin, or promotes it if the email already exists.
Run it once after setup; after that, use `POST /api/superadmin/admins` to
create any further admin accounts through the API.

## Changelog — bug fixes & new features (this batch)

- **Fixed**: `createBlog` was hardcoding every new post as a draft, ignoring the `isPublished` field sent from the admin form — "Publish immediately" silently did nothing. Now respected correctly.
- **Fixed**: `validityDays` on a Plan is now optional — omit it for a plan that never expires. Activation logic handles this (no `expiresAt` set).
- **New**: `Plan.paymentQr` and `Plan.upiId` — Super Admin can attach a payment QR code + UPI ID to a plan, shown to the buyer/seller at purchase time.
- **New**: `PlanPurchase.paymentScreenshot` + `PUT /api/plans/my-purchases/:id/payment-proof` — buyer/seller can upload proof of payment after purchasing, for the admin to check before activating.
- **New**: `GET /api/admin/plan-purchases/revenue` now also returns a `purchasers` array (who bought what, when, for how much) — not just aggregate totals.
- **New**: Real image upload — `POST /api/upload` (multipart/form-data, field name `image`) uploads to Cloudinary and returns `{ url, publicId }`. Used by property photos, blog covers, and plan QR codes. **Requires real `CLOUDINARY_*` values in `.env`** — see `.env.example`.

## Next phase (Phase 5)

- Frontend build (Next.js + TypeScript) — connecting all of this backend to real UI
- This is the last major piece: the backend now covers everything in your original V1 scope (auth, roles, properties, sale+rental, approval workflow, leads, seller plans, buyer/tenant assisted-search plans, offline payment activation, refunds, blog, super admin user/admin management)

Ask Claude to continue when you're ready.
