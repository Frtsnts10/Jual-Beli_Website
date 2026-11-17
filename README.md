# Shop Website — Dynamic Storefront & Checkout (B2C)

Buyer-facing storefront for every store created in **Shop-Dashboard**. Renders one of
five templates per store, runs a cart-less two-field checkout (email + WhatsApp) paid to
the seller's own QRIS, and offers an order-tracking / warranty portal.

Spec: `plan-storefront.md` (phase 1 implemented).

## Routing

`src/proxy.ts` maps the request host to a store:

| Host | Served from |
| --- | --- |
| `toko.<ROOT_DOMAIN>/…` | `/toko/…` (subdomain) |
| `namatoko.com/…` | `/namatoko.com/…` (custom domain, Ultimate only) |
| `<ROOT_DOMAIN>/toko/…`, `localhost`, `*.vercel.app` | path-based, as-is |

It also stores `?ref=<username>` in a 30-day cookie; checkout copies it to the order.

| Route (inside a store) | |
| --- | --- |
| `/` | Storefront in the store's template |
| `/checkout/[productId]` | Instant checkout (no cart) |
| `/checkout?item=<productId>` | Deep link for WhatsApp catalogue bots |
| `/checkout/success?order=` | Payment status, auto-refreshes until the webhook lands |
| `/track` | Order lookup (invoice ID + email) and warranty claim |

## Templates

`src/components/templates/`: Bento Grid, List Minimalist (with search), Hero Catalog,
App Store Hub, Neo-Brutalist. The template comes from
`stores.storefront_config.layout_template`; templates outside the owner's plan fall back
to Hero Catalog.

## Data access

Server-side Admin SDK only. The storefront reads `stores` (via `store_slugs` /
`store_domains`) and published `products`, and creates `orders` with
`payment_status: "PENDING"` — price and title always come from the database. It never
reads `credentials_vault` or the store's private integrations; stock is shown from the
denormalised `products.stock_available` counter maintained by the dashboard.

## Payment (seller's own QRIS)

Each seller uploads their static QRIS in the dashboard (`stores.payment.qris_payload`).
Checkout adds a 1–499 rupiah *kode unik* so transfers can be told apart, and
`/bayar/[orderId]` shows the same QRIS with that exact amount filled in (dynamic QRIS,
`lib/qris.ts`) — the money goes straight to the seller. The buyer must upload a screenshot
(`payment_proofs/{orderId}`, compressed in the browser) within 60 minutes; the seller checks
their mutations and confirms or rejects in the dashboard, which is the only place an order
becomes PAID.

**Cart** (`/keranjang`, kept in the browser per store): a checkout of several products makes one
order per unit, grouped under the first order (`group_id`): one QRIS for `group_total`, one
kode unik and one proof. `/struk/[orderId]` is the printable receipt of a paid checkout.

**Seller alerts**: the first proof of a checkout puts a notification in the dashboard bell (and
push) of the store owner and admins. With Pro/Ultimate, a WhatsApp provider and a seller number
set in the dashboard, it also sends a WhatsApp through n8n — set `N8N_WEBHOOK_URL` and
`N8N_WEBHOOK_SECRET` (same values as the dashboard) and optionally `DASHBOARD_PUBLIC_URL` (the
link a tapped push opens).

## Project layout

```
src/
  proxy.ts             host → store routing, ?ref capture
  app/                 [storeSlug]/ (storefront, checkout, track), .well-known/store-check
  components/templates the 5 storefront templates
  features/            checkout and track (UI + server actions)
  lib/                 store/product reads, pricing, QRIS, vouchers, rate limiting, Firebase Admin
  types/schema.ts      copy of the dashboard's data model
```

Firestore rules and indexes are owned by the **Shop-Dashboard** repo (deployed from there).

## Development

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3001     # then open http://localhost:3001/<store-slug>
```

## Abuse protection

Checkout (10 / 10 min), order lookup (20 / 10 min) and warranty claims (5 / hour) are
rate-limited per client IP (`src/lib/rate-limit.ts`, stored hashed in `rate_limits`).
Enable a Firestore TTL policy on `rate_limits.expire_at` so old windows are deleted.
CI (`.github/workflows/ci.yml`) runs typecheck, lint and build on every PR.
