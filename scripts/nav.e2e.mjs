// Runtime verification of navigation + scrolling against the running dev server.
// Uses the system Chrome via Playwright's channel (no bundled Chromium needed).
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const NAV = 96; // sticky-navbar offset budget (scroll-padding-top: 6rem)
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const scrollY = () => page.evaluate(() => window.scrollY);
// Wait for a smooth scroll to finish: poll until scrollY stops changing.
async function settle(p = page) {
  let prev = -1;
  let cur = await p.evaluate(() => window.scrollY);
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(100);
    prev = cur;
    cur = await p.evaluate(() => window.scrollY);
    if (cur === prev) break;
  }
  return cur;
}
const topOf = (sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? el.getBoundingClientRect().top : null;
  }, sel);

async function toFooter() {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
}
async function clickNav(label) {
  // desktop header nav link by text
  await page.click(`header nav a:has-text("${label}")`);
  await page.waitForTimeout(900);
}

async function run(lang) {
  await page.goto(`${BASE}/${lang}`, { waitUntil: "networkidle" });

  // TEST 1 — footer -> Home -> top
  await toFooter();
  await clickNav(lang === "ar" ? "الرئيسية" : "Home");
  { const y = await settle(); ok(`[${lang}] TEST1 Home returns to top`, y <= 2, `scrollY=${y}`); }

  // TEST 2 — footer -> About -> heading visible, clear of navbar
  await toFooter();
  await clickNav(lang === "ar" ? "من نحن" : "About");
  {
    const t = await topOf("#about");
    ok(`[${lang}] TEST2 About aligned under navbar`, t !== null && t >= 0 && t <= NAV + 8, `#about top=${Math.round(t)}`);
  }

  // TEST 3 — footer -> Contact -> location section (#visit)
  await toFooter();
  await clickNav(lang === "ar" ? "اتصل بنا" : "Contact");
  {
    const t = await topOf("#visit");
    ok(`[${lang}] TEST3 Contact -> #visit aligned`, t !== null && t >= 0 && t <= NAV + 8, `#visit top=${Math.round(t)}`);
  }

  // TEST 4 — footer -> Menu -> menu route top
  await toFooter();
  await clickNav(lang === "ar" ? "القائمة" : "Menu");
  await page.waitForURL(`**/${lang}/menu`, { timeout: 5000 });
  { const y = await settle(); ok(`[${lang}] TEST4 Menu route at top`, y <= 2, `url=${page.url()} scrollY=${y}`); }

  // TEST 6 — route change does not keep stale scroll: scroll menu down, go Home, expect top
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  await clickNav(lang === "ar" ? "الرئيسية" : "Home");
  await page.waitForURL(`**/${lang}`, { timeout: 5000 });
  { const y = await settle(); ok(`[${lang}] TEST6 route change resets scroll`, y <= 2, `scrollY=${y}`); }
}

// TEST 5 — mobile nav (small viewport) on EN
async function runMobile() {
  const m = await ctx.newPage();
  await m.setViewportSize({ width: 390, height: 780 });
  await m.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await m.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await m.waitForTimeout(300);
  await m.click('button[aria-label="Open menu"]');
  await m.waitForTimeout(300);
  await m.locator('a:visible', { hasText: "About" }).first().click();
  await m.waitForTimeout(900);
  const t = await m.evaluate(() => {
    const el = document.querySelector("#about");
    return el ? el.getBoundingClientRect().top : null;
  });
  ok(`[mobile] TEST5 mobile menu About aligned`, t !== null && t >= 0 && t <= NAV + 8, `#about top=${Math.round(t)}`);
  await m.close();
}

// TEST 9 — maps link destination
async function runMaps() {
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  const href = await page.getAttribute('#visit a.btn-accent', "href");
  ok("TEST9 directions link -> Shujah Mall", !!href && /destination=Shujah/i.test(href), href || "");
  const iframe = await page.getAttribute("#visit iframe", "src");
  ok("TEST9 embed -> Shujah Mall", !!iframe && /q=Shujah/i.test(iframe), iframe || "");
}

// Cross-route hash + deep-link: ScrollReset must NOT swallow these.
async function runCrossRoute() {
  // On /menu, click About (different route + hash) -> home #about aligned
  await page.goto(`${BASE}/en/menu`, { waitUntil: "networkidle" });
  await clickNav("About");
  await page.waitForURL("**/en#about", { timeout: 5000 });
  await settle();
  {
    const t = await topOf("#about");
    ok("cross-route Menu->About aligned", t !== null && t >= 0 && t <= NAV + 8, `#about top=${Math.round(t)}`);
  }
  // Deep link with hash loads scrolled to the section, not top
  await page.goto(`${BASE}/en#visit`, { waitUntil: "networkidle" });
  await settle();
  {
    const t = await topOf("#visit");
    ok("deep-link #visit lands on section", t !== null && t >= 0 && t <= NAV + 8, `#visit top=${Math.round(t)}`);
  }
}

try {
  await run("en");
  await run("ar"); // TEST 7 — same suite in Arabic
  await runMobile();
  await runCrossRoute();
  await runMaps();
} catch (e) {
  console.error("ERROR", e);
  ok("harness", false, String(e));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
