# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the South Sudanese and Arabic-speaking diaspora community in Kenya ordering
familiar home-style food. They arrive on a phone, often reading Arabic, and want
to recognize dishes by name (foul, kisira, komonia, cow-leg soup), see the price
in KES, build an order, and send it — without an account, app install, or online
payment. Secondary user: restaurant staff who run the whole site (menu, prices,
images, promotions, homepage, delivery info, WhatsApp number, SEO) from an
admin CMS without touching code.

## Product Purpose

Bit Bladi is a real, operating restaurant's ordering site. It lets customers
browse a bilingual (EN/AR) menu, build a cart with delivery details, and place
the order by opening a pre-filled WhatsApp message to the restaurant. Success is
a completed WhatsApp order and staff who can keep every price, dish, photo, and
piece of homepage copy current themselves. There is no duplicated or hardcoded
content: the public site reads everything live from the database.

## Positioning

A community-facing South Sudanese restaurant storefront that treats WhatsApp as the
checkout and Arabic as a first-class language (full RTL, Tajawal font, bilingual
content everywhere), backed by a no-code CMS so the restaurant owns every word
and price. The pairing — diaspora-authentic bilingual menu + WhatsApp ordering +
staff-editable everything — is the differentiator, not a generic food-delivery
template.

## Operating Context

- Phone-first, often on slower mobile connections.
- Ordering flow ends off-site in WhatsApp (`wa.me/<number>?text=...`); the site
  builds the message, WhatsApp sends it. No in-app payment or checkout.
- Every `[lang]` route is force-dynamic; each admin edit revalidates the public
  site so changes appear immediately.
- Single-instance restaurant deployment (SQLite); uploaded images live on disk
  at `public/uploads`.

## Capabilities and Constraints

- Bilingual EN/AR with full RTL (logical CSS `start/end`, `ms/me`, `ps/pe`);
  Arabic uses Tajawal.
- Menu: dishes with EN+AR name/description, KES price, photo, category,
  availability, featured, popular, sort order.
- Categories, promotions (with start/end dates, auto-hide when expired), media
  library (with in-use detection), and settings (business name, currency,
  WhatsApp number, hero, about, why-us, delivery ETA/fee, contact, socials,
  footer, SEO) — all CMS-managed.
- Cart persisted to `localStorage` (Zustand).
- Admin auth: bcrypt passwords, signed JWT session cookie, protected `/admin/*`.
- Currency is KES.
- Constraint: ordering is WhatsApp-only by design — no online payment/checkout.

## Brand Commitments

- Name: **Bit Bladi**.
- Logo: `public/logo.png` is the official mark — preserve it.
- Bilingual EN/AR with full RTL is non-negotiable.
- WhatsApp-only ordering is a fixed product decision, not a placeholder.
- The admin CMS is intentionally neutral/functional and visually distinct from
  the public site's premium look.

## Evidence on Hand

- Real menu with real KES prices and Arabic names, seeded from the original Bit
  Bladi menu (`prisma/seed.ts`): South Sudanese/East-African dishes across soups,
  grills, Friday specials, and more.
- Real dish and hero photography in `public/uploads` (e.g. `dish-foul.jpg`,
  `dish-cow-leg-soup.jpg`, `hero-1..4.jpg`); some images are AI-generated
  (`gemini-generated-*`).
- Official logo at `public/logo.png`.
- No customer testimonials, reviews, order volumes, or press are confirmed as
  real — future work must not fabricate any. (A Testimonial model exists; treat
  its contents as seed/placeholder unless the restaurant supplies real ones.)

## Product Principles

1. WhatsApp is the checkout — every ordering path must end in a clean, complete,
   correctly-formatted WhatsApp message, in the customer's language.
2. Arabic is first-class, not a translation afterthought — RTL and bilingual
   parity hold on every surface.
3. The restaurant owns its content — nothing customer-facing is hardcoded;
   design must survive arbitrary CMS-edited text and image lengths.
4. Recognizability over novelty for the menu — diaspora customers order by
   familiar dish names and photos; clarity of dish, price, and availability wins.
5. Fast on a phone — minimal, fast-loading pages for mobile-first, real-world
   connections.
