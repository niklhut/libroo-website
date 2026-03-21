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

This repository deploys via GitHub Actions (not Cloudflare Dashboard Git builds).

1. Create a production D1 database.

```bash
pnpm wrangler d1 create libroo-website
```

1. Add GitHub repository secrets.

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID` (production DB UUID)
- `CLOUDFLARE_D1_PREVIEW_DATABASE_ID` (optional dedicated preview DB UUID)
- `NUXT_UI_PRO_LICENSE`
- `NUXT_TURNSTILE_SECRET_KEY_PRODUCTION`
- `NUXT_TURNSTILE_SECRET_KEY_PREVIEW` (optional; falls back to production secret)

1. Add GitHub repository variables used by `nuxt.config.ts` vars injection.

- `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NUXT_SITE_URL`
- `NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC`
- `NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_WEBSITE_ID` (optional)

1. Workflows.

- Push to `main` runs `.github/workflows/deploy-production.yml`.
- Pull request updates run `.github/workflows/deploy-preview.yml`.
- Closing a pull request runs `.github/workflows/cleanup-preview.yml`.

Preview deploy behavior:

- Each PR gets a dedicated Worker name: `libroo-preview-pr-<number>`.
- Each PR gets a dedicated D1 database: `libroo-preview-pr-<number>`.
- On PR close, the preview Worker and D1 DB are deleted.

Production deploy behavior:

- Uses `libroo-website` Worker name.
- Applies migrations against production D1 before deploy.
- Routes custom domain only for production deploys.

For local/manual CLI usage, you can still run:

```bash
pnpm db:migrate:remote
pnpm deploy
```

For local `pnpm dev`, the app applies Drizzle migrations for the local sqlite fallback on server startup.


## 🗃️ Migrate Existing SQLite Data To D1

If you already have data in `local.db`, migrate it into D1 like this:

1. Ensure your D1 schema exists first.

```bash
pnpm db:migrate:remote
```

1. Export data from local SQLite as id-preserving inserts.

```bash
mkdir -p data
sqlite3 local.db "SELECT 'INSERT OR IGNORE INTO waitlist(id, email, created_at) VALUES (' || id || ', ' || quote(email) || ', ' || quote(created_at) || ');' FROM waitlist;" > data/waitlist-import.sql
```

1. Keep autoincrement in sync after import.

```bash
echo "INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES ('waitlist', (SELECT IFNULL(MAX(id), 0) FROM waitlist));" >> data/waitlist-import.sql
```

1. Execute the import against D1.

```bash
pnpm build
pnpm wrangler d1 execute libroo-website --remote --file=data/waitlist-import.sql --config .output/server/wrangler.json
```

1. Verify row counts before/after.

```bash
sqlite3 local.db "SELECT COUNT(*) FROM waitlist;"
pnpm wrangler d1 execute libroo-website --remote --command "SELECT COUNT(*) FROM waitlist;" --config .output/server/wrangler.json
```

📜 License

This project is licensed under the MIT License. See [LICENSE](/LICENSE) for details.