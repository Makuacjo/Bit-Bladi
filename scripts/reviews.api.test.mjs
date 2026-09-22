// Backend test suite for the review engine. Runs against the dev server.
// Admin auth uses a JWT minted with the same AUTH_SECRET the app uses.
import { SignJWT } from "jose";

const BASE = "http://localhost:3000";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-change-me-32chars-minimum-secret"
);

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

let adminCookie = "";
async function mintAdmin() {
  const token = await new SignJWT({ sub: "test", email: "admin@bitbladi.com", role: "admin", name: "Admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
  adminCookie = `bb_session=${token}`;
}

let ipCounter = 0;
function submit(body, { ip } = {}) {
  const addr = ip || `10.0.0.${++ipCounter}`; // unique IP => own rate-limit bucket
  return fetch(`${BASE}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": addr },
    body: JSON.stringify(body),
  });
}
const publicGet = (page = 1, perPage = 100) =>
  fetch(`${BASE}/api/reviews?page=${page}&perPage=${perPage}`).then((r) => r.json());
const adminGet = (qs = "status=ALL&perPage=200") =>
  fetch(`${BASE}/api/admin/reviews?${qs}`, { headers: { Cookie: adminCookie }, cache: "no-store" }).then((r) => r.json());
const adminFindByName = async (name) => {
  const d = await adminGet(`status=ALL&perPage=200&q=${encodeURIComponent(name)}`);
  return d.reviews.find((r) => r.customerName === name);
};

async function run() {
  await mintAdmin();
  const tag = `T${Date.now()}`;

  // ---- TEST 1: submit without account -> saved PENDING ----
  const name1 = `${tag}-Alice`;
  const r1 = await submit({ customerName: name1, rating: 5, reviewText: "Wonderful authentic food, loved it!" });
  const b1 = await r1.json();
  const rec1 = await adminFindByName(name1);
  check("T1 submit w/o account -> 201 + moderation flag", r1.status === 201 && b1.moderation === true, `status=${r1.status}`);
  check("T1 stored as PENDING", !!rec1 && rec1.status === "PENDING", rec1 ? rec1.status : "not found");

  // ---- TEST 2: not visible publicly before approval ----
  const pub2 = await publicGet();
  const leaked2 = pub2.reviews.some((r) => r.customerName === name1);
  check("T2 pending review hidden from public", !leaked2);

  // ---- TEST 9 (setup): submit with private email ----
  const name9 = `${tag}-Emailer`;
  await submit({ customerName: name9, rating: 4, reviewText: "Great service and tasty meals.", email: "secret@example.com" });
  const rec9 = await adminFindByName(name9);
  check("T9 admin sees private email", !!rec9 && rec9.email === "secret@example.com", rec9 ? String(rec9.email) : "not found");

  // ---- TEST 6: invalid ratings rejected by server ----
  const rHigh = await submit({ customerName: `${tag}-Bad`, rating: 7, reviewText: "rating too high" });
  const rLow = await submit({ customerName: `${tag}-Bad`, rating: 0, reviewText: "rating too low" });
  const rNeg = await submit({ customerName: `${tag}-Bad`, rating: -3, reviewText: "negative rating" });
  check("T6 rating>5 rejected (422)", rHigh.status === 422);
  check("T6 rating<1 rejected (422)", rLow.status === 422 && rNeg.status === 422);

  // empty / too-long text rejected
  const rEmpty = await submit({ customerName: `${tag}-Bad`, rating: 3, reviewText: "" });
  const rLong = await submit({ customerName: `${tag}-Bad`, rating: 3, reviewText: "x".repeat(2000) });
  check("T6b empty text rejected", rEmpty.status === 422);
  check("T6b over-long text rejected", rLong.status === 422);

  // ---- TEST 7: unauthorized approve denied ----
  const anyId = rec1.id;
  const unauth = await fetch(`${BASE}/api/admin/reviews/${anyId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "approve" }),
  });
  const unauthList = await fetch(`${BASE}/api/admin/reviews?status=ALL`);
  const unauthDel = await fetch(`${BASE}/api/admin/reviews/${anyId}`, { method: "DELETE" });
  check("T7 approve without auth -> 401", unauth.status === 401, `status=${unauth.status}`);
  check("T7 admin list without auth -> 401", unauthList.status === 401);
  check("T7 delete without auth -> 401", unauthDel.status === 401);

  // ---- TEST 8: public endpoint never returns non-approved ----
  const admAll = await adminGet();
  const nonApprovedNames = new Set(admAll.reviews.filter((r) => r.status !== "APPROVED").map((r) => r.customerName));
  const pub8 = await publicGet(1, 200);
  const anyLeak = pub8.reviews.some((r) => nonApprovedNames.has(r.customerName));
  check("T8 no pending/rejected in public feed", !anyLeak);

  // ---- TEST 9: public payload exposes no email/status fields ----
  const sample = pub8.reviews[0] || {};
  const fields = Object.keys(sample);
  check("T9 public review has no email/status keys", !fields.includes("email") && !fields.includes("status"), `keys=${fields.join(",")}`);

  // ---- TEST 10 (before) capture stats ----
  const statsBefore = (await publicGet()).stats;

  // ---- TEST 3: admin approves pending -> becomes public ----
  const appr = await fetch(`${BASE}/api/admin/reviews/${rec1.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ action: "approve" }),
  });
  const pub3 = await publicGet(1, 200);
  const nowVisible = pub3.reviews.some((r) => r.customerName === name1);
  check("T3 approve -> 200", appr.status === 200);
  check("T3 approved review now public", nowVisible);

  // ---- TEST 10: stats updated after approval ----
  const statsAfter = pub3.stats;
  check("T10 total increased after approval", statsAfter.total === statsBefore.total + 1, `${statsBefore.total} -> ${statsAfter.total}`);
  check("T10 average recomputed (approved only)", typeof statsAfter.average === "number" && statsAfter.average >= 1 && statsAfter.average <= 5, `avg=${statsAfter.average}`);

  // ---- TEST 4: reject -> stays hidden ----
  const rec9b = await adminFindByName(name9);
  await fetch(`${BASE}/api/admin/reviews/${rec9b.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ action: "reject" }),
  });
  const pub4 = await publicGet(1, 200);
  check("T4 rejected review hidden from public", !pub4.reviews.some((r) => r.customerName === name9));

  // ---- TEST 5: delete -> gone from public + stats ----
  const totalBeforeDel = (await publicGet()).stats.total;
  const delRes = await fetch(`${BASE}/api/admin/reviews/${rec1.id}`, { method: "DELETE", headers: { Cookie: adminCookie } });
  const pub5 = await publicGet(1, 200);
  const gone = !pub5.reviews.some((r) => r.customerName === name1);
  check("T5 delete -> 200", delRes.status === 200);
  check("T5 deleted review not public", gone);
  check("T5 stats total decreased after delete", pub5.stats.total === totalBeforeDel - 1, `${totalBeforeDel} -> ${pub5.stats.total}`);

  // ---- Honeypot: filled hidden field -> success but not saved ----
  const hpName = `${tag}-Honey`;
  const hp = await submit({ customerName: hpName, rating: 5, reviewText: "spam spam spam buy now", website: "http://spam.example" });
  const hpRec = await adminFindByName(hpName);
  check("Honeypot returns ok", hp.status === 200 || hp.status === 201);
  check("Honeypot submission NOT stored", !hpRec);

  // ---- Rate limit: 4 rapid posts from same IP -> 4th blocked ----
  const ip = "203.0.113.55";
  const codes = [];
  for (let i = 0; i < 4; i++) {
    const rr = await submit({ customerName: `${tag}-RL${i}`, rating: 4, reviewText: `rate limit probe number ${i}` }, { ip });
    codes.push(rr.status);
  }
  check("RateLimit allows 3 then blocks (429)", codes.slice(0, 3).every((c) => c === 201) && codes[3] === 429, `codes=${codes.join(",")}`);

  // Cleanup: remove test rows we created (best-effort)
  const leftovers = (await adminGet(`status=ALL&perPage=200&q=${tag}`)).reviews;
  for (const r of leftovers) {
    await fetch(`${BASE}/api/admin/reviews/${r.id}`, { method: "DELETE", headers: { Cookie: adminCookie } });
  }

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}

run().catch((e) => {
  console.error("ERROR", e);
  process.exit(1);
});
