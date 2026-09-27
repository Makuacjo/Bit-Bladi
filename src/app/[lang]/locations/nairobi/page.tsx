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

const PATH = "/locations/nairobi";

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
    image: "/uploads/hero-2.jpg",
    title: ar
      ? "مطعم سوداني جنوبي في نيروبي | بيت بلدي"
      : "South Sudanese Restaurant in Nairobi | Bit Bladi",
    description: ar
      ? "بيت بلدي مطعم سوداني جنوبي في نيروبي، بشجاع مول، كيليماني. أطباق أصيلة ومشاوي وحساء. مفتوح يوميًا ١٠:٠٠–٢٢:٠٠. اطلب عبر واتساب."
      : "Bit Bladi is a South Sudanese restaurant in Nairobi, at Shujah Mall, Kilimani. Authentic dishes, grills and soups. Open daily 10:00–22:00. Order on WhatsApp.",
  });
}

export default async function NairobiPage({
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
    ? "مطعم سوداني جنوبي في نيروبي"
    : "South Sudanese Restaurant in Nairobi";

  const faqs = ar
    ? [
        { question: "أين يقع بيت بلدي في نيروبي؟", answer: `يقع بيت بلدي في ${address}.` },
        { question: "ما ساعات العمل؟", answer: hours },
        {
          question: "كيف أطلب؟",
          answer: "تصفّح القائمة عبر الموقع ثم أرسل طلبك عبر واتساب، أو تفضّل بزيارتنا في المطعم.",
        },
      ]
    : [
        { question: "Where is Bit Bladi in Nairobi?", answer: `Bit Bladi is located at ${address}.` },
        { question: "What are the opening hours?", answer: hours },
        {
          question: "How do I order?",
          answer: "Browse the menu on our website and send your order on WhatsApp, or visit us at the restaurant.",
        },
      ];

  const data: ArticleData = ar
    ? {
        eyebrow: "نيروبي، كينيا",
        title,
        intro:
          "بيت بلدي مطعم سوداني جنوبي في قلب نيروبي، يقدّم مأكولات أصيلة في أجواء دافئة. تجدنا في كيليماني.",
        image: { src: "/uploads/hero-2.jpg", alt: "بيت بلدي، مطعم سوداني جنوبي في نيروبي" },
        sections: [
          {
            heading: "أين تجدنا",
            paras: [`العنوان: ${address}.`, `ساعات العمل: ${hours}.`, `الهاتف: ${c.phone}.`],
          },
          {
            heading: "ماذا نقدّم",
            paras: [
              "مطبخ سوداني جنوبي أصيل: مشاوي، وحساء غني، وأطباق خضار، وأطباق رئيسية مثل المندي. طعام مُعدّ ليُشارك.",
            ],
          },
          {
            heading: "كيف تزورنا أو تطلب",
            paras: [
              "تصفّح القائمة عبر الإنترنت واطلب عبر واتساب، أو تفضّل بزيارتنا في المطعم. يمكنك أيضًا حجز طاولة مسبقًا.",
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
          { href: `/${l}/locations/kilimani`, label: "مطعمنا في كيليماني" },
          { href: `/${l}/food/south-sudanese-food`, label: "الطعام السوداني الجنوبي" },
          { href: `/${l}/reserve`, label: "احجز طاولة" },
        ],
      }
    : {
        eyebrow: "Nairobi, Kenya",
        title,
        intro:
          "Bit Bladi is a South Sudanese restaurant in the heart of Nairobi, serving authentic cuisine in a warm setting. You'll find us in Kilimani.",
        image: { src: "/uploads/hero-2.jpg", alt: "Bit Bladi, a South Sudanese restaurant in Nairobi" },
        sections: [
          {
            heading: "Where to find us",
            paras: [`Address: ${address}.`, `Opening hours: ${hours}.`, `Phone: ${c.phone}.`],
          },
          {
            heading: "What we serve",
            paras: [
              "Authentic South Sudanese cuisine: charcoal grills, rich soups, vegetable dishes and mains such as Mandi. Food made to be shared.",
            ],
          },
          {
            heading: "How to visit or order",
            paras: [
              "Browse the menu online and order on WhatsApp, or visit us at the restaurant. You can also reserve a table in advance.",
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
          { href: `/${l}/locations/kilimani`, label: "Our restaurant in Kilimani" },
          { href: `/${l}/food/south-sudanese-food`, label: "South Sudanese food" },
          { href: `/${l}/reserve`, label: "Reserve a table" },
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
