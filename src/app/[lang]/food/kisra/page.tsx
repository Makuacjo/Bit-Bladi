import type { Metadata } from "next";
import { locales, type Lang } from "@/lib/i18n";
import { getMenu, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/site/JsonLd";
import { SeoArticle, type ArticleData } from "@/components/site/SeoArticle";
import { pageMetadata, webPageJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const PATH = "/food/kisra";
const KISRA_IMAGE = "/uploads/kisira-1789253334878.jpg";

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
    image: KISRA_IMAGE,
    title: ar
      ? "الكسرة: الخبز السوداني الجنوبي التقليدي في نيروبي"
      : "Kisra: Traditional South Sudanese Flatbread in Nairobi",
    description: ar
      ? "ما هي الكسرة؟ خبز رقيق مخمّر من الذرة الرفيعة يُقدَّم مع اليخنات في المطبخ السوداني الجنوبي. تذوّق النكهات الأصيلة في بيت بلدي، كيليماني."
      : "What is Kisra? A thin, fermented sorghum flatbread served with stews in South Sudanese cuisine. Taste authentic flavours at Bit Bladi in Kilimani, Nairobi.",
  });
}

export default async function KisraPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const ar = l === "ar";
  const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
  // If Kisra is on the live menu, surface its real price honestly — otherwise
  // the page stays informational and links to the full menu.
  const kisraItem = menu.find((m) =>
    /kis[iy]?ra/i.test(`${m.nameEn} ${m.nameAr}`)
  );
  const kisraPrice = kisraItem
    ? formatPrice(kisraItem.price, settings.currency, l)
    : null;

  const title = ar ? "الكسرة" : "Kisra";

  const faqs = ar
    ? [
        {
          question: "ما هي الكسرة؟",
          answer:
            "الكسرة خبز رقيق ومخمّر يُصنع من عجينة الذرة الرفيعة ويُطهى على صاج ساخن، وهو من أساسيات المطبخ السوداني والسوداني الجنوبي.",
        },
        {
          question: "كيف تُقدَّم الكسرة؟",
          answer:
            "تُقدَّم الكسرة عادة مع اليخنات والمرق وأطباق الخضار، حيث تُستخدم لغمس الطعام وتناوله.",
        },
      ]
    : [
        {
          question: "What is Kisra?",
          answer:
            "Kisra is a thin, fermented flatbread made from a sorghum batter and cooked on a hot plate. It is a staple of Sudanese and South Sudanese cuisine.",
        },
        {
          question: "How is Kisra served?",
          answer:
            "Kisra is usually served alongside stews, rich sauces and vegetable dishes, and is used to scoop up the food as you eat.",
        },
      ];

  const tasteParas = ar
    ? [
        kisraPrice
          ? `الكسرة متوفرة في بيت بلدي بسعر ${kisraPrice}. تصفّح القائمة الكاملة واطلب عبر واتساب.`
          : "في بيت بلدي نقدّم مجموعة من الأطباق السودانية الجنوبية الأصيلة التي تُكمّلها النكهات التقليدية. تصفّح القائمة الكاملة واطلب عبر واتساب.",
      ]
    : [
        kisraPrice
          ? `Kisra is available at Bit Bladi for ${kisraPrice}. Browse the full menu and order on WhatsApp.`
          : "At Bit Bladi we serve a range of authentic South Sudanese dishes built around these traditional flavours. Browse the full menu and order on WhatsApp.",
      ];

  const data: ArticleData = ar
    ? {
        eyebrow: "طبق سوداني جنوبي تقليدي",
        title,
        intro:
          "الكسرة خبز رقيق مخمّر من الذرة الرفيعة، وهو حجر أساس في المطبخ السوداني الجنوبي. في بيت بلدي بكيليماني، نيروبي، نحتفي بهذه التقاليد العريقة.",
        image: {
          src: KISRA_IMAGE,
          alt: "الكسرة، خبز الذرة الرفيعة السوداني الجنوبي التقليدي، في بيت بلدي",
        },
        sections: [
          {
            heading: "ما هي الكسرة",
            paras: [
              "الكسرة خبز رقيق يُصنع من عجينة مخمّرة من دقيق الذرة الرفيعة، ثم يُطهى على صاج ساخن حتى يصبح خفيفًا ومرنًا. قوامها الرقيق يجعلها مثالية لغمس اليخنات والمرق.",
            ],
          },
          {
            heading: "الكسرة في المطبخ السوداني الجنوبي",
            paras: [
              "تُعدّ الكسرة من الأطباق الأساسية التي تُقدَّم على المائدة المشتركة، وتُرافق اللحوم والحساء وأطباق الخضار. إنها جزء من تجربة طعام اجتماعية دافئة.",
            ],
          },
          {
            heading: "تذوّق النكهات في بيت بلدي",
            paras: tasteParas,
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "تصفّح القائمة", primary: true },
          { href: `/${l}/food/south-sudanese-food`, label: "المطبخ السوداني الجنوبي" },
        ],
        related: [
          { href: `/${l}/food/south-sudanese-food`, label: "الطعام السوداني الجنوبي" },
          { href: `/${l}/locations/kilimani`, label: "مطعمنا في كيليماني" },
          { href: `/${l}/menu`, label: "القائمة الكاملة" },
        ],
      }
    : {
        eyebrow: "Traditional South Sudanese Dish",
        title,
        intro:
          "Kisra is a thin, fermented sorghum flatbread and a cornerstone of South Sudanese cuisine. At Bit Bladi in Kilimani, Nairobi, we celebrate these time-honoured traditions.",
        image: {
          src: KISRA_IMAGE,
          alt: "Kisra, traditional South Sudanese sorghum flatbread, at Bit Bladi",
        },
        sections: [
          {
            heading: "What is Kisra",
            paras: [
              "Kisra is a thin bread made from a fermented sorghum-flour batter, then cooked on a hot plate until light and pliable. Its delicate texture makes it perfect for scooping up stews and sauces.",
            ],
          },
          {
            heading: "Kisra in South Sudanese cuisine",
            paras: [
              "Kisra is one of the staple foods served at the shared table, accompanying meats, soups and vegetable dishes. It is part of a warm, social way of eating together.",
            ],
          },
          {
            heading: "Taste the flavours at Bit Bladi",
            paras: tasteParas,
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "Browse the menu", primary: true },
          { href: `/${l}/food/south-sudanese-food`, label: "South Sudanese cuisine" },
        ],
        related: [
          { href: `/${l}/food/south-sudanese-food`, label: "South Sudanese food" },
          { href: `/${l}/locations/kilimani`, label: "Our restaurant in Kilimani" },
          { href: `/${l}/menu`, label: "Full menu" },
        ],
      };

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ lang: l, path: PATH, name: title, description: data.intro }),
          breadcrumbJsonLd([
            { name: ar ? "الرئيسية" : "Home", path: `/${l}` },
            { name: ar ? "الطعام السوداني الجنوبي" : "South Sudanese Food", path: `/${l}/food/south-sudanese-food` },
            { name: title, path: `/${l}${PATH}` },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <SeoArticle
        lang={l}
        breadcrumbs={[
          { name: ar ? "الرئيسية" : "Home", path: `/${l}` },
          { name: ar ? "الطعام السوداني الجنوبي" : "South Sudanese Food", path: `/${l}/food/south-sudanese-food` },
          { name: title },
        ]}
        data={data}
      />
    </>
  );
}
