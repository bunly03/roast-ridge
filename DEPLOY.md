# Deploying Roast & Ridge — Step by Step

Total time: ~15 minutes. You said you have *some but not all* of GitHub /
Vercel / Supabase — just skip the steps for the ones you already have.

---

## Step 1 — Supabase (database)

1. Go to https://supabase.com → Sign up / log in (free tier is enough).
2. Click **New Project**. Name it `roast-ridge`, set a database password
   (save it somewhere), pick any region, click **Create**. Wait ~2 min for
   it to spin up.
3. In the left sidebar, open **SQL Editor** → **New query**.
4. Open `supabase-schema.sql` (included in this package), copy all of it,
   paste it into the SQL editor, and click **Run**. This creates the
   `products` and `orders` tables and inserts the 6 sample products.
5. Go to **Project Settings** (gear icon) → **API**. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)
6. Open `script.js` in this package and replace the two placeholder lines
   near the top:
   ```js
   const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
   ```
   with your actual values. Save the file.

   > If you skip this step, the site still works perfectly — it just shows
   > local sample data instead of live database data (see the small status
   > line above the product grid). But for full credit, connect it.

## Step 2 — GitHub (source control)

1. Go to https://github.com → sign up / log in.
2. Click **New repository**. Name it `roast-ridge`, keep it **Public**,
   don't add a README (we already have files), click **Create repository**.
3. On the new repo's page, click **uploading an existing file** and drag
   in all files from this package (`index.html`, `style.css`, `script.js`,
   `supabase-schema.sql`, `README.md`). Commit directly to `main`.

   *(Or, if you're comfortable with git locally:)*
   ```bash
   git init
   git add .
   git commit -m "Roast & Ridge storefront"
   git branch -M main
   git remote add origin https://github.com/<your-username>/roast-ridge.git
   git push -u origin main
   ```

## Step 3 — Vercel (hosting / the live URL)

1. Go to https://vercel.com → sign up / log in **with your GitHub account**
   (this is the easiest option and auto-connects the two).
2. Click **Add New** → **Project**.
3. Select your `roast-ridge` GitHub repo → click **Import**.
4. Framework preset: choose **Other** (this is a static site, no build
   step needed). Leave build/output settings blank. Click **Deploy**.
5. Wait ~30 seconds. Vercel will give you a live URL like:
   `https://roast-ridge-yourname.vercel.app`
6. Open that URL and click through: browse products → add to cart →
   checkout → place demo order. Confirm no errors appear (open browser
   DevTools → Console to double check).

   *(Netlify is an equally valid alternative: https://app.netlify.com →
   "Add new site" → "Import an existing project" → connect the same
   GitHub repo → Deploy. No build command needed there either.)*

## Step 4 — Finalize your report

Copy the live URL from Step 3 into the report PDF (`Report.pdf` /
`Report_Roast_and_Ridge.docx`) where it says `[PASTE YOUR LIVE URL HERE]`,
then re-export/save it before submitting.

---

### Troubleshooting
- **Blank product grid / "Showing sample data"**: your Supabase URL/key in
  `script.js` are still placeholders, or the SQL script wasn't run. The
  page itself won't error — it just uses fallback data.
- **404 on Vercel**: make sure `index.html` is at the repo root, not
  inside a subfolder.
- **Fonts/images not loading**: check your network/firewall isn't
  blocking `fonts.googleapis.com` or `images.unsplash.com`.
