# Bit Bladi

A premium, bilingual (English / Arabic) food-ordering website with a complete admin CMS.
Customers browse the menu, build a cart, enter delivery details, and send their order via
WhatsApp. Restaurant staff manage everything — dishes, prices, images, promotions, homepage
content, delivery info, WhatsApp number, and SEO — from an admin dashboard, **without touching
source code**.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Prisma 6 + MySQL / MariaDB** — single authoritative data source (Hostinger-ready)
- **Framer Motion** — subtle, premium motion
- **Zustand** — client cart state (persisted to `localStorage`)
- **jose** (JWT session cookies) + **bcryptjs** (password hashing) for admin auth

## Getting started

```bash
npm install                 # installs deps + runs `prisma generate`
cp .env.example .env        # set DATABASE_URL (MySQL) + a strong AUTH_SECRET
npm run db:migrate          # create the MySQL schema via Prisma Migrate
npm run db:seed             # seed menu, categories, testimonials, settings, admin user
npm run dev                 # http://localhost:3000
```

Default admin login (change in production):

```
Email:    admin@bitbladi.com
Password: bitbladi123
```

Public site: `http://localhost:3000/en` (or `/ar`). Admin: `http://localhost:3000/admin`.

## Scripts

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Dev server                                          |
| `npm run build`     | Production build                                     |
| `npm start`         | Run production build                                |
| `npm run lint`      | ESLint                                              |
| `npm run db:migrate`| Create/apply a dev migration (Prisma Migrate)        |
| `npm run db:deploy` | Apply pending migrations (production)                |
| `npm run db:push`   | Push schema without a migration (quick prototyping)  |
| `npm run db:seed`   | Seed database                                        |
| `npm run db:reset`  | Wipe + re-migrate + reseed (dev only — destructive)  |

## Environment variables

| Var             | Required | Notes                                                        |
| --------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`  | yes      | MySQL connection, e.g. `mysql://user:pass@host:3306/db`      |
| `AUTH_SECRET`   | yes      | Signs admin session cookies. Use a long random value.        |
| `SITE_URL`      | no       | Absolute base URL for `robots.txt` / `sitemap.xml`           |
| `ADMIN_EMAIL`   | no       | Overrides seeded admin email                                 |
| `ADMIN_PASSWORD`| no       | Overrides seeded admin password                              |

Secrets live only in `.env` (git-ignored). Nothing sensitive is hardcoded in the app.

## Architecture

```
src/
  app/
    layout.tsx            Root <html> — sets lang/dir from proxy header, loads fonts
    [lang]/               Public site (en | ar), force-dynamic so CMS edits show instantly
      layout.tsx          Navbar + Footer + CartDrawer, per-locale metadata
      page.tsx            Homepage (hero, featured, categories, promos, about, delivery, …)
      menu/page.tsx       Full menu browser
    admin/                CMS (neutral, functional UI — distinct from the luxury public site)
      layout.tsx          Auth-gated chrome (sidebar); login renders bare
      login/page.tsx      Credential login (server action + bcrypt)
      page.tsx            Dashboard stats
      menu | categories | promotions | media | settings
      actions.ts          All admin server actions (auth-guarded, revalidate public site)
    api/upload/route.ts   Auth-checked image upload -> /public/uploads + Media row
    robots.ts sitemap.ts
  components/site/         Public UI (Navbar, Hero, FoodCard, MenuBrowser, CartDrawer, …)
  components/admin/        CMS UI (managers + ImageUploader)
  lib/
    db.ts                 Prisma singleton
    data.ts               Server read helpers (getMenu, getSettings, …)
    content.ts            Editable-content schema + defaults + deep-merge
    i18n.ts               Locales + UI string dictionary
    types.ts format.ts    Shared types + currency formatting
    whatsapp.ts           Single WhatsApp order-message builder
    auth.ts admin.ts      Session (jose) + requireAdmin guard
    cart-store.ts ui-store.ts  Client state
  proxy.ts                Locale routing + admin route protection (Next 16 "proxy")
prisma/schema.prisma      Category, FoodItem, Promotion, Testimonial, Media, AdminUser, Settings
prisma/seed.ts            Seed from the original Bit Bladi menu
```

### Public ↔ CMS connection

The public site reads everything from the database via `src/lib/data.ts`. All `[lang]` routes
are `force-dynamic`, and every admin mutation calls `revalidatePath("/", "layout")`, so a price
change, new image, availability toggle, or content edit appears on the customer site immediately.
There is **no** duplicated/hardcoded content source.

## CMS capabilities

- **Menu**: create / edit / delete dishes; EN + AR name & description; price; photo upload;
  category; availability; featured; popular; sort order.
- **Categories**: create / edit / delete / enable-disable / reorder; EN + AR names.
- **Promotions**: EN + AR title & description; image; start/end dates; active toggle
  (expired promotions auto-hide from the public site).
- **Media library**: upload, preview, in-use detection, safe delete.
- **Settings**: business name, currency, WhatsApp number; homepage hero (text + rotating
  images); about; why-us points; delivery (text, ETA, fee); contact; social links; footer; SEO.
- **Auth**: bcrypt passwords, signed JWT session cookie, protected `/admin/*` routes, logout.

## WhatsApp ordering

`src/lib/whatsapp.ts` is the single source that turns a cart + delivery details + settings into
a formatted message (EN or AR), then opens `https://wa.me/<number>?text=...`. The number and
currency come from CMS settings — never hardcoded in components.

## Bilingual / RTL

Locale is the first URL segment (`/en`, `/ar`). `proxy.ts` sets an `x-lang` header; the root
layout applies `lang` + `dir` to `<html>`. Arabic uses the Tajawal font and full RTL layout
(logical CSS properties: `start/end`, `ms/me`, `ps/pe`). UI strings live in `lib/i18n.ts`;
editable content is bilingual in the CMS.

## Deployment (Hostinger Web/Cloud, or any Node host)

Requires a MySQL/MariaDB database. On Hostinger, create one in hPanel → Databases and copy the
credentials into `DATABASE_URL`.

```bash
npm ci
npm run db:deploy                    # apply migrations (non-destructive)
npm run db:seed                      # FIRST deploy only — seeds baseline content + admin
npm run build
npm start
```

Set `DATABASE_URL`, `AUTH_SECRET`, and `SITE_URL` in the host environment (never commit them).
`npm run db:deploy` (`prisma migrate deploy`) is safe to re-run on every deploy — it only applies
pending migrations and never drops data. Do **not** run `db:seed` or `db:reset` against a
production database with real orders/reviews. Uploaded images are written to `public/uploads` —
use a persistent disk/volume there (or swap the upload route for object storage).

## Provenance

Rebuilt from four reference projects. The original **Bit Bladi** static site supplied the real
menu (dishes, KES prices, Arabic names), the WhatsApp ordering idea, and the EN/AR concept —
all rewritten into this typed, database-driven, CMS-backed app. Dingo / Restoran / Sarab were
studied for layout and motion direction only; none of their jQuery/Bootstrap code was carried
over (kept the site minimal and fast).
