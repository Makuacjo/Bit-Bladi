import type { Metadata } from "next";
import { locales, type Lang } from "@/lib/i18n";
import { getSettings } from "@/lib/data";
import { JsonLd } from "@/components/site/JsonLd";
import { SeoArticle, type ArticleData } from "@/components/site/SeoArticle";
import {
  pageMetadata,
  webPageJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  restaurantJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const PATH = "/locations/kilimani";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const ar = l === "ar";
  return pageMetadata({
    lang: l,
    path: PATH,
    image: "/uploads/hero-4.jpg",
    title: ar
      ? "مطعم سوداني جنوبي وأفريقي في كيليماني | بيت بلدي"
      : "South Sudanese & African Restaurant in Kilimani | Bit Bladi",
    description: ar
      ? "بيت بلدي في شجاع مول، كيليماني — الطابق الأول، مقابل أدلايف بلازا. مطعم سوداني جنوبي وأفريقي أصيل في نيروبي. اطلب عبر واتساب."
      : "Bit Bladi at Shujah Mall, Kilimani — first floor, opposite Adlife Plaza. An authentic South Sudanese and African restaurant in Nairobi. Order on WhatsApp.",
  });
}

export default async function KilimaniPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const ar = l === "ar";
  const settings = await getSettings();
  const c = settings.content.contact;
  const address = ar ? c.address.ar : c.address.en;
  const hours = ar ? c.hours.ar : c.hours.en;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`;
  const waUrl = `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`;

  const title = ar
    ? "مطعم سوداني جنوبي في كيليماني"
    : "South Sudanese Restaurant in Kilimani";

  const faqs = ar
    ? [
        { question: "أين يقع بيت بلدي في كيليماني؟", answer: `${address}.` },
        { question: "ما ساعات العمل؟", answer: hours },
        {
          question: "ما نوع المطبخ؟",
          answer: "مطبخ سوداني جنوبي وأفريقي أصيل: مشاوي، وحساء، وأطباق خضار، وأطباق رئيسية.",
        },
      ]
    : [
        { question: "Where is Bit Bladi in Kilimani?", answer: `${address}.` },
        { question: "What are the opening hours?", answer: hours },
        {
          question: "What kind of cuisine is it?",
          answer: "Authentic South Sudanese and African cuisine: grills, soups, vegetable dishes and mains.",
        },
      ];

  const data: ArticleData = ar
    ? {
        eyebrow: "كيليماني، نيروبي",
        title,
        intro:
          "بيت بلدي مطعم سوداني جنوبي وأفريقي في كيليماني بنيروبي. تجدنا في شجاع مول — الطابق الأول، مقابل أدلايف بلازا.",
        image: { src: "/uploads/hero-4.jpg", alt: "بيت بلدي في شجاع مول، كيليماني، نيروبي" },
        sections: [
          {
            heading: "موقعنا في كيليماني",
            paras: [`${address}.`, `ساعات العمل: ${hours}.`, `الهاتف: ${c.phone}.`],
          },
          {
            heading: "تجربة الطعام",
            paras: [
              "مطبخ سوداني جنوبي وأفريقي أصيل في أجواء دافئة ومرحّبة. أطباق مُعدّة لتُشارك بين الأصدقاء والعائلة.",
            ],
          },
          {
            heading: "زُرنا أو اطلب",
            paras: [
              "سهل الوصول في قلب كيليماني. تصفّح القائمة واطلب عبر واتساب، أو احجز طاولة، أو تفضّل بزيارتنا.",
            ],
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "تصفّح القائمة", primary: true },
          { href: waUrl, label: "اطلب عبر واتساب" },
          { href: mapsUrl, label: "الاتجاهات" },
        ],
        related: [
          { href: `/${l}/locations/nairobi`, label: "بيت بلدي في نيروبي" },
          { href: `/${l}/food/south-sudanese-food`, label: "الطعام السوداني الجنوبي" },
          { href: `/${l}/food/kisra`, label: "الكسرة" },
        ],
      }
    : {
        eyebrow: "Kilimani, Nairobi",
        title,
        intro:
          "Bit Bladi is a South Sudanese and African restaurant in Kilimani, Nairobi. Find us at Shujah Mall — first floor, opposite Adlife Plaza.",
        image: { src: "/uploads/hero-4.jpg", alt: "Bit Bladi at Shujah Mall, Kilimani, Nairobi" },
        sections: [
          {
            heading: "Our Kilimani location",
            paras: [`${address}.`, `Opening hours: ${hours}.`, `Phone: ${c.phone}.`],
          },
          {
            heading: "The dining experience",
            paras: [
              "Authentic South Sudanese and African cuisine in a warm, welcoming setting. Dishes made to be shared among friends and family.",
            ],
          },
          {
            heading: "Visit or order",
            paras: [
              "Easy to reach in the heart of Kilimani. Browse the menu and order on WhatsApp, reserve a table, or come in and visit.",
            ],
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "Browse the menu", primary: true },
          { href: waUrl, label: "Order on WhatsApp" },
          { href: mapsUrl, label: "Get directions" },
        ],
        related: [
          { href: `/${l}/locations/nairobi`, label: "Bit Bladi in Nairobi" },
          { href: `/${l}/food/south-sudanese-food`, label: "South Sudanese food" },
          { href: `/${l}/food/kisra`, label: "Kisra" },
        ],
      };

  return (
    <>
      <JsonLd
        data={[
          restaurantJsonLd(settings),
          webPageJsonLd({ lang: l, path: PATH, name: title, description: data.intro }),
          breadcrumbJsonLd([
            { name: ar ? "الرئيسية" : "Home", path: `/${l}` },
            { name: title, path: `/${l}${PATH}` },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <SeoArticle
        lang={l}
        breadcrumbs={[
          { name: ar ? "الرئيسية" : "Home", path: `/${l}` },
          { name: title },
        ]}
        data={data}
      />
    </>
  );
}
