# Libroo Website

This is the landing page for **[Libroo](https://libroo.app)** — a personal library app for tracking your books, managing collections, and keeping track of what you’ve lent to friends.

You can find the main libroo repository [here](https://github.com/niklhut/libroo).

## ✨ Features

- Responsive and fast landing page
- Light/dark mode with a custom toggle (click & right-click interactions)
- Early-access signup modal with email capture
- Spam protection via Cloudflare Turnstile
- Privacy-friendly analytics using [Umami](https://umami.is)
- Configurable legal pages without repository-bundled legal text

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

- `CLOUDFLARE_ACCOUNT_SUBDOMAIN` (Workers subdomain prefix used to build preview URLs, e.g. `<subdomain>.workers.dev`)
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NUXT_SITE_URL`
- `NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_SCRIPT_INPUT_SRC`
- `NUXT_PUBLIC_SCRIPTS_UMAMI_ANALYTICS_WEBSITE_ID` (optional)
- `NUXT_LEGAL_IMPRINT_REDIRECT_URL` or `NUXT_LEGAL_IMPRINT_MARKDOWN_URL` (optional)
- `NUXT_LEGAL_PRIVACY_REDIRECT_URL` or `NUXT_LEGAL_PRIVACY_MARKDOWN_URL` (optional)
- `NUXT_LEGAL_CLIENT_PLACEHOLDERS_URL` (optional)

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

## Legal Pages

The `/imprint` and `/privacy` routes are intentionally configurable and do not ship legal copy in this repository.

Each page supports two modes:

- Set `NUXT_LEGAL_IMPRINT_REDIRECT_URL` or `NUXT_LEGAL_PRIVACY_REDIRECT_URL` to redirect visitors to an external legal page.
- Set `NUXT_LEGAL_IMPRINT_MARKDOWN_URL` or `NUXT_LEGAL_PRIVACY_MARKDOWN_URL` to fetch and render markdown from an HTTPS URL.

Redirect URLs take precedence over markdown URLs. If neither variable is set, the route renders a neutral unconfigured message.

Markdown URLs can point to any public HTTPS source, for example a public Cloudflare R2 object, S3 object, GitHub raw file, or a small Cloudflare Worker endpoint that reads from KV/R2 and returns markdown. Keeping the markdown outside environment variables avoids Worker variable size limits and keeps deployment-specific legal text out of the open-source repository.

Markdown pages can also contain client-rendered placeholders for contact details that should not be present in the initial server-rendered HTML. Add tokens like `{{LEGAL_CONTROLLER_NAME}}`, `{{LEGAL_CONTROLLER_ADDRESS}}`, `{{LEGAL_CONTACT_EMAIL}}`, or `{{LEGAL_CONTACT_PHONE}}` to the markdown, then set `NUXT_LEGAL_CLIENT_PLACEHOLDERS_URL` to a public HTTPS JSON object:

```json
{
  "LEGAL_CONTROLLER_NAME": "Example Name",
  "LEGAL_CONTROLLER_ADDRESS": "Street 1\n12345 City\nCountry",
  "LEGAL_CONTACT_EMAIL": "hello@example.com",
  "LEGAL_CONTACT_PHONE": "+49 000 000000"
}
```

During SSR those tokens are replaced with neutral fallback text. After the page hydrates in the browser, the app fetches `/api/legal/placeholders` and renders the configured values. This is crawler friction, not access control: clients that run JavaScript or fetch the JSON/API directly can still read the contact data.

## 📜 License

This project is licensed under the MIT License. See [LICENSE](/LICENSE) for details.
