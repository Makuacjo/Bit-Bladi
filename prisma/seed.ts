import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultContent } from "../src/lib/content";

const prisma = new PrismaClient();

type Seed = {
  nameEn: string;
  nameAr: string;
  price: number;
  featured?: boolean;
  popular?: boolean;
  image?: string;
};

const categories: { slug: string; nameEn: string; nameAr: string; items: Seed[] }[] = [
  {
    slug: "soups",
    nameEn: "Soups",
    nameAr: "الحساء",
    items: [
      { nameEn: "Goat Soup", nameAr: "شوربة ضان", price: 500 },
      { nameEn: "Cow Leg Soup", nameAr: "شوربة كوارع", price: 500, featured: true, popular: true, image: "/uploads/dish-cow-leg-soup.jpg" },
      { nameEn: "Fish Soup", nameAr: "شوربة سمك", price: 500 },
    ],
  },
  {
    slug: "grills",
    nameEn: "Grills",
    nameAr: "المشاوي",
    items: [
      { nameEn: "Half Chicken", nameAr: "نصف دجاج", price: 900 },
      { nameEn: "Full Chicken", nameAr: "دجاج كامل", price: 1800 },
      { nameEn: "1Kg Sha", nameAr: "صاج", price: 1800 },
    ],
  },
  {
    slug: "friday",
    nameEn: "Friday Specials",
    nameAr: "عروض الجمعة",
    items: [
      { nameEn: "Rowb", nameAr: "روب", price: 500 },
      { nameEn: "Am Fitfit", nameAr: "ام فتفت", price: 500 },
      { nameEn: "Kijek", nameAr: "كجيك", price: 600 },
    ],
  },
  {
    slug: "others",
    nameEn: "Main Dishes",
    nameAr: "الأطباق الرئيسية",
    items: [
      { nameEn: "Lamb Mandi", nameAr: "مندي لحم", price: 1000, popular: true },
      { nameEn: "Chicken Mandi", nameAr: "مندي دجاج", price: 900, popular: true },
      { nameEn: "Shawarma", nameAr: "شاورما", price: 550, popular: true },
      { nameEn: "Fried Chicken", nameAr: "دجاج مقلي", price: 900 },
      { nameEn: "Fried Fish", nameAr: "سمك مقلي", price: 850, featured: true, popular: true, image: "/uploads/dish-fried-fish.jpg" },
      { nameEn: "Chicken Masala", nameAr: "دجاج مسالا", price: 800 },
      { nameEn: "Kofta", nameAr: "كفتة", price: 600 },
      { nameEn: "Chicken Wings", nameAr: "أجنحة دجاج", price: 700, popular: true },
      { nameEn: "Chicken Curry", nameAr: "كاري الدجاج", price: 700 },
      { nameEn: "Pilau", nameAr: "بيلاو", price: 900 },
      { nameEn: "Coconut Fish", nameAr: "سمك بجوز الهند", price: 850 },
      { nameEn: "Khodrah Mafrokah", nameAr: "خضرة مفروكة", price: 600, featured: true, popular: true, image: "/uploads/dish-khodrah-mafrokah.jpg" },
      { nameEn: "Bamia (Okrah)", nameAr: "بامية مفروكة", price: 500, popular: true, image: "/uploads/dish-bamia.jpg" },
      { nameEn: "Khodrah Tabigh", nameAr: "خضرة طبيخ", price: 600, popular: true, image: "/uploads/dish-khodrah-tabigh.jpg" },
      { nameEn: "Combo Meat", nameAr: "كمبو لحم", price: 500, popular: true, image: "/uploads/dish-combo-meat.jpg" },
      { nameEn: "Combo Fish", nameAr: "كمبو سمك", price: 550 },
      { nameEn: "Adas", nameAr: "فتة عدس", price: 600 },
      { nameEn: "Ghema", nameAr: "قيمة", price: 500 },
      { nameEn: "Foul", nameAr: "فول", price: 500, popular: true, image: "/uploads/dish-foul.jpg" },
      { nameEn: "Egg Plant", nameAr: "سلطة أسود", price: 500, popular: true, image: "/uploads/dish-egg-plant.jpg" },
      { nameEn: "Fried Eggs", nameAr: "بيض بالطوة", price: 300, image: "/uploads/dish-fried-eggs.jpg" },
      { nameEn: "Fried Goat Meat", nameAr: "ضان مقلي", price: 2000, featured: true, popular: true, image: "/uploads/dish-fried-goat-meat.jpg" },
    ],
  },
];

const testimonials = [
  {
    name: "Santo Thiep",
    textEn: "The food is absolutely delicious! Authentic flavors that remind me of home.",
    textAr: "الطعام لذيذ للغاية! نكهات أصيلة تذكرني بالوطن.",
  },
  {
    name: "Bol Dut",
    textEn: "Best restaurant in Kilimani! Amazing hospitality and generous portions.",
    textAr: "أفضل مطعم في كيليماني! ضيافة رائعة ووجبات سخية.",
  },
  {
    name: "Poth",
    textEn: "Fresh ingredients and authentic taste. The Friday specials are a must-try.",
    textAr: "مكونات طازجة وطعم أصيل. عروض الجمعة يجب تجربتها.",
  },
  {
    name: "Makuac John",
    textEn: "Finally a place with real South Sudanese cuisine. The Mandi is exceptional!",
    textAr: "أخيرًا مكان يقدّم مطبخًا سودانيًا جنوبيًا حقيقيًا. المندي استثنائي!",
  },
  {
    name: "Santo Ngor",
    textEn: "Amazing food and wonderful atmosphere. Friendly staff and quick service.",
    textAr: "طعام رائع وأجواء ممتعة. طاقم ودود وخدمة سريعة.",
  },
];

async function main() {
  // Settings singleton
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "Bit Bladi",
      currency: "KES",
      whatsappNumber: "254798022831",
      content: JSON.stringify(defaultContent),
    },
  });

  // Categories + items
  for (let ci = 0; ci < categories.length; ci++) {
    const c = categories[ci];
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameEn: c.nameEn, nameAr: c.nameAr, sort: ci },
      create: { slug: c.slug, nameEn: c.nameEn, nameAr: c.nameAr, sort: ci },
    });
    for (let ii = 0; ii < c.items.length; ii++) {
      const it = c.items[ii];
      const existing = await prisma.foodItem.findFirst({
        where: { nameEn: it.nameEn, categoryId: cat.id },
      });
      const data = {
        nameEn: it.nameEn,
        nameAr: it.nameAr,
        price: it.price,
        image: it.image ?? "",
        featured: !!it.featured,
        popular: !!it.popular,
        sort: ii,
        categoryId: cat.id,
      };
      if (existing) await prisma.foodItem.update({ where: { id: existing.id }, data });
      else await prisma.foodItem.create({ data });
    }
  }

  // Testimonials
  await prisma.testimonial.deleteMany();
  for (let i = 0; i < testimonials.length; i++) {
    await prisma.testimonial.create({ data: { ...testimonials[i], sort: i } });
  }

  // Reviews — only seed samples when the table is empty, so we never clobber
  // real customer submissions on a re-seed.
  if ((await prisma.review.count()) === 0) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const sample = [
      { customerName: "Aluel Deng", rating: 5, reviewText: "The Lamb Mandi was outstanding — generous portions and authentic flavour. Felt like home.", status: "APPROVED", ageDays: 2 },
      { customerName: "James Okello", rating: 5, reviewText: "Best South Sudanese food in Nairobi. The cow leg soup is a must-try. Warm, friendly service.", status: "APPROVED", ageDays: 6 },
      { customerName: "نيالا ماير", rating: 4, reviewText: "طعام لذيذ وأجواء رائعة. المندي ممتاز والخدمة سريعة. سأعود بالتأكيد.", status: "APPROVED", ageDays: 9 },
      { customerName: "Peter Garang", rating: 5, reviewText: "Fresh, delicious and reasonably priced. The Friday specials are excellent.", status: "APPROVED", ageDays: 14 },
      { customerName: "Mary Achol", rating: 4, reviewText: "Really enjoyed the grilled chicken. Cozy spot at Shujah Mall, easy to find.", status: "APPROVED", ageDays: 20 },
      { customerName: "Spam Bot", rating: 1, reviewText: "Cheap deals visit my site now!!!", status: "PENDING", ageDays: 0 },
    ];
    for (const s of sample) {
      const created = new Date(now - s.ageDays * day);
      await prisma.review.create({
        data: {
          customerName: s.customerName,
          rating: s.rating,
          reviewText: s.reviewText,
          status: s.status,
          createdAt: created,
          approvedAt: s.status === "APPROVED" ? created : null,
        },
      });
    }
  }

  // Admin user
  const email = process.env.ADMIN_EMAIL || "admin@bitbladi.com";
  const password = process.env.ADMIN_PASSWORD || "bitbladi123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Bit Bladi Admin", role: "super" },
  });

  console.log(`Seed complete. Admin login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
