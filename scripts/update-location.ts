// One-off: update the stored restaurant location to the official address.
// The Settings.content JSON was seeded before the address change and the seed's
// upsert only writes `content` on create, so a re-seed won't touch it. This
// patches just the location-related fields and leaves everything else intact.
import { PrismaClient } from "@prisma/client";
import { mergeContent } from "../src/lib/content";

const prisma = new PrismaClient();

const address = {
  en: "Shujah Mall, Kilimani, First Floor — Opposite Adlife Plaza",
  ar: "شجاع مول، كيليماني، الطابق الأول — مقابل أدلايف بلازا",
};
const aboutBody = {
  en: "Welcome to Bit Bladi, your home for authentic South Sudanese cuisine in the heart of Nairobi. At Shujah Mall, Kilimani — first floor, opposite Adlife Plaza — we bring the rich flavors and traditions of South Sudan to your table.",
  ar: "مرحبًا بكم في بيت بلدي، موطن المأكولات السودانية الجنوبية الأصيلة في قلب نيروبي. في شجاع مول، كيليماني — الطابق الأول، مقابل أدلايف بلازا — نقدّم لكم نكهات وتقاليد جنوب السودان الغنية إلى مائدتكم.",
};

async function main() {
  const row = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!row) throw new Error("Settings singleton not found — run db:seed first.");

  let parsed: unknown = {};
  try {
    parsed = row.content ? JSON.parse(row.content) : {};
  } catch {
    parsed = {};
  }
  const content = mergeContent(parsed);

  content.contact.address = address;
  content.contact.plusCode = "";
  content.contact.mapQuery = "Shujah Mall, Kilimani, Nairobi";
  content.about.body = aboutBody;

  await prisma.settings.update({
    where: { id: "singleton" },
    data: { content: JSON.stringify(content) },
  });

  console.log("Location updated:");
  console.log("  address.en :", content.contact.address.en);
  console.log("  mapQuery   :", content.contact.mapQuery);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
