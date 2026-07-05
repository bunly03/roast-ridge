# Roast & Ridge — Artisan Coffee Storefront (Demo)

A static e-commerce landing page built for a class assignment. Features:

- Product catalog (images, descriptions, prices) loaded from **Supabase**,
  with automatic fallback to local sample data so the page never errors.
- A slide-out **shopping cart** (add, change quantity, remove items).
- A **checkout modal** that simulates placing an order — **no real
  payment is processed**. Optionally logs the demo order to a Supabase
  `orders` table.
- Pure HTML/CSS/JavaScript — no build step, deployable as a static site
  to Vercel, Netlify, or GitHub Pages.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page markup: header, hero, product grid, cart drawer, checkout modal |
| `style.css` | All styling |
| `script.js` | Supabase product loading, cart logic, mock checkout |
| `supabase-schema.sql` | SQL to create & seed the `products` and `orders` tables |
| `DEPLOY.md` | Step-by-step deployment instructions (Supabase → GitHub → Vercel) |

## Quick local preview

Just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Without Supabase configured, the page automatically shows local sample
data — it will never show a blank/error page.

See **DEPLOY.md** for full deployment instructions.
