import { prisma } from "../src/lib/db";
import { getMenu, getSettings, orderConfig } from "../src/lib/data";
import { buildOrderMessage } from "../src/lib/whatsapp";
import { validateCart } from "../src/app/actions";
import type { CartLine, DeliveryDetails } from "../src/lib/types";

async function main() {
  const results: string[] = [];
  const assert = (name: string, cond: boolean) =>
    results.push(`${cond ? "PASS" : "FAIL"}  ${name}`);

  // 1. Menu loads
  const menu = await getMenu();
  assert("menu has dishes", menu.length >= 30);

  // 2. CMS price change reflects in public data layer
  const shawarma = await prisma.foodItem.findFirst({ where: { nameEn: "Shawarma" } });
  if (!shawarma) throw new Error("Shawarma not seeded");
  await prisma.foodItem.update({ where: { id: shawarma.id }, data: { price: 600 } });
  const after = (await getMenu()).find((m) => m.id === shawarma.id);
  assert("price update reflects (550 -> 600)", after?.price === 600);
  await prisma.foodItem.update({ where: { id: shawarma.id }, data: { price: shawarma.price } });

  // 3. Sold-out (available:false) stays visible in the public menu, flagged unavailable
  await prisma.foodItem.update({ where: { id: shawarma.id }, data: { available: false } });
  const soldOutRow = (await getMenu()).find((m) => m.id === shawarma.id);
  assert("sold-out dish stays visible on public menu", !!soldOutRow && soldOutRow.available === false);
  await prisma.foodItem.update({ where: { id: shawarma.id }, data: { available: true } });

  // 4. WhatsApp message generation (EN + AR)
  const settings = await getSettings();
  const cfg = orderConfig(settings);
  const lines: CartLine[] = [
    { id: shawarma.id, nameEn: "Shawarma", nameAr: "شاورما", price: 550, image: "", quantity: 2 },
    { id: "x", nameEn: "Pilau", nameAr: "بيلاو", price: 900, image: "", quantity: 1 },
  ];
  const details: DeliveryDetails = {
    name: "John Doe",
    phone: "+254700000000",
    area: "Kilimani",
    building: "Green Apartments",
    room: "23",
    floor: "2",
    notes: "No onions",
  };
  const en = buildOrderMessage(lines, details, cfg, "en");
  const ar = buildOrderMessage(lines, details, cfg, "ar");
  const total = 2 * 550 + 900; // 2000
  assert("EN msg has customer name", en.includes("John Doe"));
  assert("EN msg has phone", en.includes("+254700000000"));
  assert("EN msg has delivery area", en.includes("Kilimani"));
  assert("EN msg has building", en.includes("Green Apartments"));
  assert("EN msg has room", en.includes("23"));
  assert("EN msg has item + qty", en.includes("2 × Shawarma"));
  assert("EN msg has total", en.includes(String(total.toLocaleString("en-KE"))));
  assert("AR msg localized item name", ar.includes("شاورما"));
  assert("AR msg has delivery label", ar.includes("تفاصيل التوصيل"));

  // 4b. Availability + visibility enforcement (Sold Out vs Hidden)
  const pilau = await prisma.foodItem.findFirst({ where: { nameEn: "Pilau" } });
  if (!pilau) throw new Error("Pilau not seeded");

  // Sold Out: still visible in public menu, but order validation rejects it
  await prisma.foodItem.update({ where: { id: pilau.id }, data: { available: false, visible: true } });
  const menuSoldOut = await getMenu();
  assert("sold-out item still visible on public menu", menuSoldOut.some((m) => m.id === pilau.id));
  const vSold = await validateCart([{ id: pilau.id, quantity: 1 }]);
  assert("server rejects ordering a sold-out item", !vSold.ok && vSold.invalid[0]?.reason === "sold_out");

  // Hidden: absent from public menu AND rejected by order validation
  await prisma.foodItem.update({ where: { id: pilau.id }, data: { visible: false } });
  const menuHidden = await getMenu();
  assert("hidden item absent from public menu", !menuHidden.some((m) => m.id === pilau.id));
  const vHidden = await validateCart([{ id: pilau.id, quantity: 1 }]);
  assert("server rejects ordering a hidden item", !vHidden.ok && vHidden.invalid[0]?.reason === "hidden");

  // Restore -> orderable again, price is authoritative (server-sourced)
  await prisma.foodItem.update({ where: { id: pilau.id }, data: { available: true, visible: true } });
  const vOk = await validateCart([{ id: pilau.id, quantity: 3 }]);
  assert("restored item passes validation", vOk.ok && vOk.lines[0]?.quantity === 3);
  assert("validation returns authoritative price", vOk.lines[0]?.price === pilau.price);
  assert("validation ignores unknown items", !(await validateCart([{ id: "does-not-exist", quantity: 1 }])).ok);

  // 5. Settings config present
  assert("whatsapp number configured", /^\d{6,}$/.test(cfg.whatsappNumber));
  assert("currency configured", cfg.currency.length > 0);

  console.log("\n--- Bit Bladi verification ---");
  console.log(results.join("\n"));
  console.log("\nSample EN WhatsApp message:\n" + en + "\n");
  const failed = results.filter((r) => r.startsWith("FAIL"));
  console.log(failed.length ? `\n${failed.length} FAILURES` : "\nALL PASSED");
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
