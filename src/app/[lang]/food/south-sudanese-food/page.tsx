import type { Metadata } from "next";
import { locales, type Lang } from "@/lib/i18n";
import { getMenu } from "@/lib/data";
import { localizedName } from "@/lib/types";
import { JsonLd } from "@/components/site/JsonLd";
import { SeoArticle, type ArticleData } from "@/components/site/SeoArticle";
import { pageMetadata, webPageJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const PATH = "/food/south-sudanese-food";

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
    image: "/uploads/hero-3.jpg",
    title: ar
      ? "الطعام السوداني الجنوبي: دليل المطبخ في نيروبي"
      : "South Sudanese Food: A Guide to the Cuisine in Nairobi",
    description: ar
      ? "تعرّف على المطبخ السوداني الجنوبي — الكسرة والعصيدة والفول والمشاوي والحساء — وأين تتذوقه في بيت بلدي، كيليماني، نيروبي."
      : "Discover South Sudanese food — Kisra, Asida, Ful, grilled meats and hearty stews — and where to taste it at Bit Bladi in Kilimani, Nairobi.",
  });
}

export default async function SouthSudaneseFoodPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const ar = l === "ar";
  const menu = await getMenu();
  const dishNames = menu.map((m) => localizedName(m, l));

  const title = ar
    ? "الطعام السوداني الجنوبي في نيروبي"
    : "South Sudanese Food in Nairobi";

  const faqs = ar
    ? [
        {
          question: "ما هو الطعام السوداني الجنوبي؟",
          answer:
            "مطبخ يعتمد على الحبوب مثل الذرة الرفيعة (الكسرة والعصيدة)، والبقوليات مثل الفول، واللحوم المشوية والمطهوة، والأسماك، وأطباق الخضار والبامية. يُقدَّم غالبًا على مائدة مشتركة.",
        },
        {
          question: "أين أتناول طعامًا سودانيًا جنوبيًا في نيروبي؟",
          answer:
            "بيت بلدي مطعم سوداني جنوبي في شجاع مول، كيليماني، نيروبي. يمكنك تصفح القائمة والطلب عبر واتساب.",
        },
      ]
    : [
        {
          question: "What is South Sudanese food?",
          answer:
            "South Sudanese cuisine is built on grains such as sorghum (used for Kisra and Asida), legumes like Ful, grilled and slow-cooked meats, fish, and vegetable and okra stews. Meals are often shared from a communal plate.",
        },
        {
          question: "Where can I eat South Sudanese food in Nairobi?",
          answer:
            "Bit Bladi is a South Sudanese restaurant at Shujah Mall, Kilimani, Nairobi. You can browse the menu online and order on WhatsApp.",
        },
      ];

  const data: ArticleData = ar
    ? {
        eyebrow: "المطبخ السوداني الجنوبي",
        title,
        intro:
          "الطعام السوداني الجنوبي مطبخ دافئ وكريم يجمع الناس حول مائدة واحدة. في بيت بلدي بكيليماني، نيروبي، نقدّم هذه النكهات الأصيلة — من الفول والمشاوي إلى الحساء وأطباق الخضار.",
        image: {
          src: "/uploads/hero-3.jpg",
          alt: "أطباق سودانية جنوبية أصيلة على مائدة بيت بلدي في نيروبي",
        },
        sections: [
          {
            heading: "ما الذي يميّز المطبخ السوداني الجنوبي",
            paras: [
              "يقوم المطبخ السوداني الجنوبي على مكوّنات بسيطة وطازجة تُطهى ببطء وحب. تشكّل الحبوب — خاصة الذرة الرفيعة — أساس أطباق مثل الكسرة والعصيدة، بينما توفّر البقوليات واللحوم والأسماك البروتين.",
              "الطعام هنا مناسبة اجتماعية: تُقدَّم الأطباق للمشاركة، وتُغمَس بها الخبز والعصيدة في الحساء والمرق الغني.",
            ],
          },
          {
            heading: "أطباق أساسية",
            bullets: [
              "الكسرة — خبز رقيق مخمّر من الذرة الرفيعة يُقدَّم مع اليخنات.",
              "العصيدة — عجينة كثيفة تُؤكل مع المرق أو اليخنة.",
              "الفول — فول مدمّس مطهو ببطء، طبق يومي محبوب.",
              "المشاوي — الدجاج واللحم المشوي على الفحم.",
              "الحساء — شوربة الضأن وكوارع البقر والسمك.",
              "أطباق الخضار — البامية والخضرة المفروكة.",
            ],
          },
          {
            heading: "تذوّق الطعام السوداني الجنوبي في بيت بلدي",
            paras: [
              dishNames.length
                ? `تضمّ قائمتنا أطباقًا مثل ${dishNames.slice(0, 6).join("، ")} وغيرها. تصفّح القائمة الكاملة واطلب عبر واتساب.`
                : "تصفّح قائمتنا الكاملة واطلب عبر واتساب.",
            ],
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "تصفّح القائمة", primary: true },
          { href: `/${l}/food/kisra`, label: "تعرّف على الكسرة" },
        ],
        related: [
          { href: `/${l}/food/kisra`, label: "الكسرة" },
          { href: `/${l}/locations/kilimani`, label: "مطعمنا في كيليماني" },
          { href: `/${l}/locations/nairobi`, label: "بيت بلدي في نيروبي" },
          { href: `/${l}/menu`, label: "القائمة الكاملة" },
        ],
      }
    : {
        eyebrow: "South Sudanese Cuisine",
        title,
        intro:
          "South Sudanese food is warm, generous cooking that brings people together around a shared table. At Bit Bladi in Kilimani, Nairobi, we serve these authentic flavours — from Ful and grilled meats to hearty soups and vegetable stews.",
        image: {
          src: "/uploads/hero-3.jpg",
          alt: "Authentic South Sudanese dishes on the table at Bit Bladi in Nairobi",
        },
        sections: [
          {
            heading: "What makes South Sudanese cuisine distinctive",
            paras: [
              "South Sudanese cooking is built on simple, fresh ingredients cooked slowly and with care. Grains — especially sorghum — form the base of staples like Kisra and Asida, while legumes, meats and fish provide the protein.",
              "Eating is a social occasion: dishes are served to share, and bread or porridge is used to scoop up rich soups and stews.",
            ],
          },
          {
            heading: "Staple dishes",
            bullets: [
              "Kisra — a thin, fermented sorghum flatbread served with stews.",
              "Asida — a thick dough eaten with sauce or stew.",
              "Ful — slow-cooked stewed fava beans, a much-loved everyday dish.",
              "Grilled meats — charcoal-grilled chicken and meat.",
              "Soups — goat soup, cow-leg soup and fish soup.",
              "Vegetable dishes — okra (Bamia) and mashed greens (Khodrah).",
            ],
          },
          {
            heading: "Taste South Sudanese food at Bit Bladi",
            paras: [
              dishNames.length
                ? `Our menu features dishes such as ${dishNames.slice(0, 6).join(", ")} and more. Browse the full menu and order on WhatsApp.`
                : "Browse our full menu and order on WhatsApp.",
            ],
          },
        ],
        faqs,
        ctas: [
          { href: `/${l}/menu`, label: "Browse the menu", primary: true },
          { href: `/${l}/food/kisra`, label: "Learn about Kisra" },
        ],
        related: [
          { href: `/${l}/food/kisra`, label: "Kisra" },
          { href: `/${l}/locations/kilimani`, label: "Our restaurant in Kilimani" },
          { href: `/${l}/locations/nairobi`, label: "Bit Bladi in Nairobi" },
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
            { name: ar ? "الطعام" : "Food", path: `/${l}/menu` },
            { name: title, path: `/${l}${PATH}` },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <SeoArticle
        lang={l}
        breadcrumbs={[
          { name: ar ? "الرئيسية" : "Home", path: `/${l}` },
          { name: ar ? "القائمة" : "Menu", path: `/${l}/menu` },
          { name: title },
        ]}
        data={data}
      />
    </>
  );
}
