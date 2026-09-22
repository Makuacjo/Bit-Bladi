// Consolidated production-readiness workflow suite: auth, protected APIs,
// reservations (availability + double-booking + admin transitions), reviews
// moderation gating, and i18n routing. Uses system Chrome for the login-UI
// no-refresh check and fetch+jose for API-level checks.
import { chromium } from "playwright";
import { SignJWT } from "jose";

const B = "http://localhost:3000";
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me-32chars-minimum-secret");
const res = [];
const ok = (n, p, d = "") => { res.push({ n, p }); console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`); };
let ipc = 0;
const xff = () => `88.0.${Math.floor(Math.random() * 254)}.${++ipc}`;

const cookie = async () =>
  `bb_session=${await new SignJWT({ sub: "t", email: "admin@bitbladi.com", role: "super", name: "Admin" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(SECRET)}`;

const b = await chromium.launch({ channel: "chrome", headless: true });

try {
  const c = await cookie();

  // ---- Auth: login UI → dashboard, no manual refresh ----
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto(`${B}/admin/login`, { waitUntil: "networkidle" });
  await p.fill('input[name="email"]', "admin@bitbladi.com");
  await p.fill('input[name="password"]', "bitbladi123");
  await p.click('button[type="submit"]');
  await p.waitForURL("**/admin", { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(400);
  ok("auth: login → /admin without refresh", /\/admin$/.test(p.url()) && /Dashboard/.test(await p.locator("body").innerText()));
  ok("auth: session cookie set", (await ctx.cookies()).some((k) => k.name === "bb_session"));
  // logout
  await p.goto(`${B}/admin`, { waitUntil: "networkidle" });
  await p.locator('button:has-text("Sign out")').click();
  await p.waitForURL("**/admin/login**", { timeout: 8000 }).catch(() => {});
  ok("auth: logout → login + cookie cleared", /\/admin\/login/.test(p.url()) && !(await ctx.cookies()).some((k) => k.name === "bb_session"));
  await ctx.close();

  // ---- Protected APIs reject unauthenticated ----
  const a1 = await fetch(`${B}/api/admin/reviews`);
  const a2 = await fetch(`${B}/api/admin/reservations`);
  const a3 = await fetch(`${B}/api/admin/reservations/x`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
  ok("authz: unauth admin reviews → 401", a1.status === 401);
  ok("authz: unauth admin reservations → 401", a2.status === 401);
  ok("authz: unauth admin PATCH → 401", a3.status === 401);

  // ---- Reservations ----
  const d = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
  const av = await (await fetch(`${B}/api/reservations/availability?date=${d}&guests=2`)).json();
  const slot = av.slots.find((s) => s.available)?.time;
  ok("resv: availability returns open slot", !!slot, slot);
  const base = { customerName: "Audit Guest", customerPhone: "+254712000000", customerEmail: "audit@example.com", date: d, preferredLanguage: "en" };
  const post = (body) => fetch(`${B}/api/reservations`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": xff() }, body: JSON.stringify(body) });
  const r1 = await post({ ...base, time: slot, guestCount: 2 });
  const b1 = await r1.json();
  ok("resv: valid → 201 PENDING + BB code", r1.status === 201 && b1.reservation?.status === "PENDING" && /^BB-[A-Z2-9]{6}$/.test(b1.reservation?.code || ""), b1.reservation?.code);
  ok("resv: past date rejected", (await post({ ...base, date: "2020-01-01", time: slot, guestCount: 2 })).status === 409);
  ok("resv: over-max guests rejected (422)", (await post({ ...base, time: slot, guestCount: 99 })).status === 422);
  // double-booking: overflow capacity (40) at one slot
  const slot2 = av.slots.filter((s) => s.available)[5]?.time || slot;
  let over;
  for (let i = 0; i < 4; i++) over = await post({ ...base, time: slot2, guestCount: 12 });
  ok("resv: capacity overflow blocked (no silent double-book)", over.status === 409, `status=${over.status}`);
  // admin confirm + invalid re-transition
  const list = await (await fetch(`${B}/api/admin/reservations?status=PENDING&perPage=200`, { headers: { Cookie: c } })).json();
  const target = list.reservations.find((x) => x.code === b1.reservation.code);
  ok("resv: appears in admin", !!target);
  const conf = await fetch(`${B}/api/admin/reservations/${target.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: c }, body: JSON.stringify({ action: "confirm" }) });
  ok("resv: admin confirm → 200", conf.status === 200);
  const reconf = await fetch(`${B}/api/admin/reservations/${target.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: c }, body: JSON.stringify({ action: "confirm" }) });
  ok("resv: invalid re-transition blocked (409)", reconf.status === 409);
  ok("resv: notif recorded SKIPPED (no creds, not faked)", target.emailStatus === "SKIPPED" && target.whatsappStatus === "SKIPPED");

  // ---- Reviews moderation gating ----
  const rvName = `AuditRev ${Date.now()}`;
  const rv = await fetch(`${B}/api/reviews`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": xff() }, body: JSON.stringify({ customerName: rvName, rating: 5, reviewText: "Audit review, should stay pending until approved.", email: "priv@example.com" }) });
  ok("reviews: submit → 201", rv.status === 201);
  const pub = await (await fetch(`${B}/api/reviews?perPage=200`)).json();
  ok("reviews: pending hidden from public", !pub.reviews.some((x) => x.customerName === rvName));
  ok("reviews: public payload has no email/status", pub.reviews[0] && !("email" in pub.reviews[0]) && !("status" in pub.reviews[0]));
  const adm = await (await fetch(`${B}/api/admin/reviews?status=PENDING&perPage=200`, { headers: { Cookie: c } })).json();
  const rTarget = adm.reviews.find((x) => x.customerName === rvName);
  await fetch(`${B}/api/admin/reviews/${rTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: c }, body: JSON.stringify({ action: "approve" }) });
  const pub2 = await (await fetch(`${B}/api/reviews?perPage=200`)).json();
  ok("reviews: approve → visible publicly", pub2.reviews.some((x) => x.customerName === rvName));

  // ---- i18n routing ----
  const en = await fetch(`${B}/en`);
  const ar = await fetch(`${B}/ar`);
  const arHtml = await ar.text();
  ok("i18n: /en 200", en.status === 200);
  ok("i18n: /ar 200 + dir=rtl", ar.status === 200 && /<html[^>]*dir="rtl"/.test(arHtml));

  // ---- cleanup test rows ----
  const leftovers = (await (await fetch(`${B}/api/admin/reservations?status=ALL&perPage=200&q=Audit Guest`, { headers: { Cookie: c } })).json()).reservations;
  for (const x of leftovers) await fetch(`${B}/api/admin/reservations/${x.id}`, { method: "DELETE", headers: { Cookie: c } });
  const rvAll = (await (await fetch(`${B}/api/admin/reviews?status=ALL&perPage=200&q=AuditRev`, { headers: { Cookie: c } })).json()).reviews;
  for (const x of rvAll) await fetch(`${B}/api/admin/reviews/${x.id}`, { method: "DELETE", headers: { Cookie: c } });
} catch (e) {
  console.error("ERROR", e);
  ok("harness", false, String(e).slice(0, 160));
} finally {
  await b.close();
}

const failed = res.filter((x) => !x.p).length;
console.log(`\n${res.length - failed}/${res.length} passed`);
process.exit(failed ? 1 : 0);
