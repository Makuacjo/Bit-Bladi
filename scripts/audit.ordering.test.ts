// Regression test for the ordering path's server-side authority.
// validateCart only accepts { id, quantity } — it NEVER accepts a client price,
// and rebuilds every line from the current DB price + availability. This proves
// price manipulation is structurally impossible and sold-out/hidden items are
// rejected. Runs directly against the real function (no HTTP).
import { validateCart } from "../src/app/actions";
import { prisma } from "../src/lib/db";

let pass = 0;
let fail = 0;
const ok = (n: string, cond: boolean, d = "") => {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

async function main() {
  const item = await prisma.foodItem.findFirst({ where: { visible: true, available: true } });
  if (!item) throw new Error("No visible/available item to test with.");

  // 1. Authoritative price — client cannot influence it (type only allows id+quantity).
  const res = await validateCart([{ id: item.id, quantity: 2 }]);
  const line = res.lines.find((l) => l.id === item.id);
  ok("valid cart accepted", res.ok && !!line);
  ok("line price = DB price (server authoritative)", line?.price === item.price, `db=${item.price} got=${line?.price}`);
  ok("total = price*qty from DB", res.total === item.price * 2, `total=${res.total}`);

  // 2. Price manipulation attempt — extra fields are ignored by the contract.
  const tampered = await validateCart([{ id: item.id, quantity: 1, price: 1 } as unknown as { id: string; quantity: number }]);
  const tline = tampered.lines.find((l) => l.id === item.id);
  ok("tampered client price ignored", tline?.price === item.price, `got=${tline?.price}`);

  // 3. Sold-out item cannot be ordered (temporarily flip, then restore).
  await prisma.foodItem.update({ where: { id: item.id }, data: { available: false } });
  const soldOut = await validateCart([{ id: item.id, quantity: 1 }]);
  ok("sold-out item rejected", !soldOut.ok && soldOut.invalid.some((i) => i.id === item.id && i.reason === "sold_out"));
  await prisma.foodItem.update({ where: { id: item.id }, data: { available: true } });

  // 4. Hidden item cannot be ordered (temporarily flip, then restore).
  await prisma.foodItem.update({ where: { id: item.id }, data: { visible: false } });
  const hidden = await validateCart([{ id: item.id, quantity: 1 }]);
  ok("hidden item rejected", !hidden.ok && hidden.invalid.some((i) => i.id === item.id && i.reason === "hidden"));
  await prisma.foodItem.update({ where: { id: item.id }, data: { visible: true } });

  // 5. Unknown id rejected.
  const missing = await validateCart([{ id: "does-not-exist", quantity: 1 }]);
  ok("unknown item rejected", !missing.ok && missing.invalid.some((i) => i.reason === "missing"));

  // Confirm restore.
  const restored = await prisma.foodItem.findUnique({ where: { id: item.id } });
  ok("item restored (visible+available)", !!restored?.visible && !!restored?.available);

  console.log(`\n${pass}/${pass + fail} passed`);
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error("ERROR", e);
  await prisma.$disconnect();
  process.exit(1);
});
