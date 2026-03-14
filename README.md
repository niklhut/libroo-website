# Libroo Website

This is the landing page for **[Libroo](https://libroo.app)** — a personal library app for tracking your books, managing collections, and keeping track of what you’ve lent to friends.

You can find the main libroo repository [here](https://github.com/niklhut/libroo).

## ✨ Features

- Responsive and fast landing page
- Light/dark mode with a custom toggle (click & right-click interactions)
- Early-access signup modal with email capture
- Spam protection via Cloudflare Turnstile
- Privacy-friendly analytics using [Umami](https://umami.is)

## 🚀 Tech Stack

- [Nuxt 4](https://nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com)
- [Tailwind CSS](https://tailwindcss.com/)
- [Nuxt SEO](https://nuxtseo.com/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Umami Analytics](https://umami.is/)

## 📦 Setup

```bash
git clone https://github.com/niklhut/libroo-website.git
cd libroo-website
pnpm install
pnpm dev
```

## ☁️ Deploy To Cloudflare Workers

This project is configured for Cloudflare Workers deployment via Wrangler.

1. Install dependencies and login to Cloudflare.

```bash
pnpm install
pnpm wrangler login
```

2. Create a D1 database.

```bash
pnpm wrangler d1 create libroo-website
```

3. Set database IDs for Nuxt's inlined Wrangler config.

```bash
export CLOUDFLARE_D1_DATABASE_ID="<production-d1-id>"
export CLOUDFLARE_D1_PREVIEW_DATABASE_ID="<preview-d1-id>"
```

Or place these in `.env` for local CLI usage.

4. Configure secrets and env vars.

```bash
pnpm wrangler secret put NUXT_TURNSTILE_SECRET_KEY
pnpm wrangler secret put NUXT_UI_PRO_LICENSE
```

Set non-secret values in `nuxt.config.ts` under `nitro.cloudflare.wrangler.vars`.

5. Apply migrations and deploy production.

```bash
pnpm deploy:migrated
```

This runs D1 migrations first and only then deploys the Worker.

Optional preview deployment:

```bash
pnpm deploy:preview:migrated
```

For local `pnpm dev`, the app applies Drizzle migrations for the local sqlite fallback on server startup.

### Cloudflare Dashboard Git Integration (Single Build Command)

If you deploy from the Cloudflare Dashboard, use this as your single build command:

```bash
pnpm build:cf
```

By default (without any extra env vars), migration target is inferred from `CF_PAGES_BRANCH`:

- `remote` when `CF_PAGES_BRANCH` matches production branch
- `preview` for all other branches

The default production branch is `main`.
If your production branch differs, set one global variable:

- `CF_PRODUCTION_BRANCH=<your-production-branch>`

Optional override:

- `CF_D1_MIGRATIONS_MODE=remote` to migrate only production D1
- `CF_D1_MIGRATIONS_MODE=preview` to migrate only preview D1
- `CF_D1_MIGRATIONS_MODE=none` to skip migrations

Migrations run after build and before Cloudflare publishes the deployment.

## 🗃️ Migrate Existing SQLite Data To D1

If you already have data in `local.db`, migrate it into D1 like this:

1. Ensure your D1 schema exists first.

```bash
pnpm db:migrate:remote
```

2. Export data from local SQLite as id-preserving inserts.

```bash
mkdir -p data
sqlite3 local.db "SELECT 'INSERT OR IGNORE INTO waitlist(id, email, created_at) VALUES (' || id || ', ' || quote(email) || ', ' || quote(created_at) || ');' FROM waitlist;" > data/waitlist-import.sql
```

3. Keep autoincrement in sync after import.

```bash
echo "INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('waitlist', (SELECT IFNULL(MAX(id), 0) FROM waitlist));" >> data/waitlist-import.sql
```

4. Execute the import against D1.

```bash
pnpm build
pnpm wrangler d1 execute libroo-website --remote --file=data/waitlist-import.sql --config .output/server/wrangler.json
```

5. Verify row counts before/after.

```bash
sqlite3 local.db "SELECT COUNT(*) FROM waitlist;"
pnpm wrangler d1 execute libroo-website --remote --command "SELECT COUNT(*) FROM waitlist;" --config .output/server/wrangler.json
```

📜 License

This project is licensed under the MIT License. See [LICENSE](/LICENSE) for details.