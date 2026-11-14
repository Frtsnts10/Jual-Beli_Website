# Shop Website — Dynamic Storefront & Checkout (B2C)

Buyer-facing storefront for every store created in **Shop-Dashboard**. Renders one of
five templates per store, runs a cart-less two-field checkout (email + WhatsApp) through
Xendit, and offers an order-tracking / warranty portal.

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
reads `credentials_vault`; of the store's private integrations it reads only the
Xendit sub-account id/status, to route payment (split payment when the seller's
XenPlatform account is LIVE, platform account otherwise); stock is shown from the denormalised
`products.stock_available` counter maintained by the dashboard. Orders become PAID only
through the dashboard's verified Xendit webhook.

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
