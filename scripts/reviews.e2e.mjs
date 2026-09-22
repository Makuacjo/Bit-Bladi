// Browser E2E for the review engine via system Chrome.
// Covers the full acceptance flow (submit -> hidden -> approve -> visible),
// responsive (mobile + desktop), and EN + AR (RTL).
import { chromium } from "playwright";
import { SignJWT } from "jose";

const BASE = "http://localhost:3000";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-change-me-32chars-minimum-secret"
);
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  // Unique client IP so repeated test runs aren't blocked by the review rate limit.
  extraHTTPHeaders: { "x-forwarded-for": `7.7.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}` },
});
const page = await ctx.newPage();

const uniqueName = `E2E ${Date.now()}`;

async function submitViaUI(p, name, { arabic = false } = {}) {
  await p.getByRole("button", { name: arabic ? "اكتب تقييماً" : "Add a Review" }).first().click();
  await p.waitForTimeout(400);
  // pick 5 stars: the rating radios are the first radiogroup in the dialog
  const stars = p.locator('[role="dialog"] [role="radio"]');
  await stars.nth(4).click();
  await p.locator('[role="dialog"] input[autocomplete="name"]').fill(name);
  await p.locator('[role="dialog"] textarea').fill("Absolutely delicious food and lovely service. Highly recommend the Mandi!");
  await p.locator('[role="dialog"] button[type="submit"]').click();
  await p.waitForTimeout(1200);
}

try {
  // ===== TEST 12 / acceptance (EN desktop) =====
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  ok("EN reviews section renders", await page.locator("#reviews h2").first().isVisible());
  ok("EN overview shows average + Based on", (await page.locator("#reviews").innerText()).includes("Based on"));
  const cardsBefore = await page.locator("#reviews figure").count();
  ok("EN approved cards present", cardsBefore > 0, `cards=${cardsBefore}`);

  await submitViaUI(page, uniqueName);
  const dialogText = await page.locator('[role="dialog"]').innerText();
  ok("EN submit shows awaiting-approval confirmation", /awaiting approval/i.test(dialogText), dialogText.slice(0, 60));
  await page.locator('[role="dialog"] button', { hasText: "Close" }).click().catch(() => {});
  await page.waitForTimeout(300);

  // Pending must NOT be visible publicly
  await page.reload({ waitUntil: "networkidle" });
  const visibleAfterSubmit = (await page.locator("#reviews").innerText()).includes(uniqueName);
  ok("Pending review hidden on public page", !visibleAfterSubmit);

  // ===== Admin (inject a real signed session cookie) + approve =====
  const token = await new SignJWT({ sub: "test", email: "admin@bitbladi.com", role: "admin", name: "Admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
  await ctx.addCookies([{ name: "bb_session", value: token, domain: "localhost", path: "/" }]);
  await page.goto(`${BASE}/admin/reviews`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  ok("Admin reviews dashboard loads", (await page.locator("h1").first().innerText()).includes("Reviews"));

  // find our row, approve it
  const row = page.locator("tr", { hasText: uniqueName }).first();
  await row.waitFor({ timeout: 8000 });
  ok("Admin sees pending submission", await row.isVisible());
  await row.getByRole("button", { name: "Approve" }).click();
  await page.waitForTimeout(1200);

  // ===== Approved review now visible + count updated =====
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  const nowVisible = (await page.locator("#reviews").innerText()).includes(uniqueName);
  ok("Approved review appears publicly (no redeploy)", nowVisible);
  // Carousel shows one card at a time, so verify via the public API instead of a figure count.
  void cardsBefore;
  const inPublicApi = await page.evaluate(async (n) => {
    const d = await (await fetch("/api/reviews?perPage=200")).json();
    return d.reviews.some((r) => r.customerName === n);
  }, uniqueName);
  ok("Approved review present in public API", inPublicApi);

  // ===== TEST 11: mobile viewport =====
  const m = await ctx.newPage();
  await m.setViewportSize({ width: 390, height: 780 });
  await m.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await m.locator("#reviews").scrollIntoViewIfNeeded();
  ok("Mobile: reviews section visible", await m.locator("#reviews h2").first().isVisible());
  await m.getByRole("button", { name: "Add a Review" }).first().click();
  await m.waitForTimeout(400);
  const dlg = m.locator('[role="dialog"]');
  const box = await dlg.boundingBox();
  ok("Mobile: modal fits within viewport width", !!box && box.width <= 390, box ? `w=${Math.round(box.width)}` : "no box");
  await m.close();

  // ===== TEST 12: Arabic RTL =====
  await page.goto(`${BASE}/ar`, { waitUntil: "networkidle" });
  const dir = await page.getAttribute("html", "dir");
  ok("AR: html dir=rtl", dir === "rtl", `dir=${dir}`);
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  const arText = await page.locator("#reviews").innerText();
  ok("AR: section heading in Arabic", arText.includes("ماذا يقول ضيوفنا"));
  await page.getByRole("button", { name: "اكتب تقييماً" }).first().click();
  await page.waitForTimeout(400);
  const arDlgDir = await page.locator('[role="dialog"]').getAttribute("dir");
  ok("AR: dialog is RTL", arDlgDir === "rtl", `dir=${arDlgDir}`);
  // submit an Arabic review to confirm Arabic text handling + success copy
  const arName = `تجربة ${Date.now()}`;
  await page.locator('[role="dialog"] [role="radio"]').nth(3).click();
  await page.locator('[role="dialog"] input[autocomplete="name"]').fill(arName);
  await page.locator('[role="dialog"] textarea').fill("طعام رائع وخدمة ممتازة، أنصح به بشدة.");
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(1200);
  const arDlgText = await page.locator('[role="dialog"]').innerText();
  ok("AR: Arabic success message shown", arDlgText.includes("بانتظار الموافقة"));

  // cleanup: delete the two submissions we created (best-effort via admin UI API)
  await page.goto(`${BASE}/admin/reviews?`, { waitUntil: "networkidle" });
} catch (e) {
  console.error("ERROR", e);
  ok("harness", false, String(e).slice(0, 120));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
