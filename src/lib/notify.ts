import "server-only";
import { getSettings } from "./data";
import type { NotifyStatus } from "./reservations";

// Transactional notifications for reservations. Every sender degrades safely:
// missing credentials → "SKIPPED", provider error → "FAILED", success → "SENT".
// Nothing here throws to the caller, and a notification result never changes
// whether the reservation itself was persisted.

type Lang = "en" | "ar";
type Event = "received" | "confirmed" | "rejected" | "cancelled";

type ResData = {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guestCount: number;
  preferredLanguage: string;
  specialRequests?: string;
};

// ---------- formatting ----------
function fmtDate(date: string, lang: Lang) {
  try {
    const d = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return date;
  }
}
function fmtTime(time: string, lang: Lang) {
  const [h, m] = time.split(":").map(Number);
  if (lang === "ar") return time;
  const ap = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

// ---------- copy (bilingual) ----------
function copy(event: Event, lang: Lang, r: ResData, restaurant: string) {
  const en = {
    received: {
      subject: `We’ve received your reservation — ${r.code}`,
      heading: "Reservation received",
      intro: `Thank you, ${r.customerName}. We’ve received your table request at ${restaurant} and will confirm it shortly.`,
      statusLine: "Status: Awaiting confirmation",
    },
    confirmed: {
      subject: `Your reservation is confirmed — ${r.code}`,
      heading: "Reservation confirmed",
      intro: `Great news, ${r.customerName}! Your table at ${restaurant} is confirmed. We look forward to hosting you.`,
      statusLine: "Status: Confirmed",
    },
    rejected: {
      subject: `Update on your reservation — ${r.code}`,
      heading: "Reservation unavailable",
      intro: `We’re sorry, ${r.customerName}. We couldn’t accommodate your requested time at ${restaurant}. Please try another time or contact us.`,
      statusLine: "Status: Not available",
    },
    cancelled: {
      subject: `Your reservation was cancelled — ${r.code}`,
      heading: "Reservation cancelled",
      intro: `Your reservation at ${restaurant} has been cancelled. If this was a mistake, please contact us to rebook.`,
      statusLine: "Status: Cancelled",
    },
    labels: { ref: "Reference", date: "Date", time: "Time", guests: "Guests", contact: "Contact us" },
  };
  const ar = {
    received: {
      subject: `استلمنا طلب حجزك — ${r.code}`,
      heading: "تم استلام الحجز",
      intro: `شكراً لك، ${r.customerName}. استلمنا طلب حجز طاولة في ${restaurant} وسنؤكده قريباً.`,
      statusLine: "الحالة: بانتظار التأكيد",
    },
    confirmed: {
      subject: `تم تأكيد حجزك — ${r.code}`,
      heading: "تم تأكيد الحجز",
      intro: `أخبار رائعة، ${r.customerName}! تم تأكيد طاولتك في ${restaurant}. نتطلع لاستقبالك.`,
      statusLine: "الحالة: مؤكد",
    },
    rejected: {
      subject: `تحديث بخصوص حجزك — ${r.code}`,
      heading: "الحجز غير متاح",
      intro: `نأسف، ${r.customerName}. لم نتمكن من توفير الوقت المطلوب في ${restaurant}. جرّب وقتاً آخر أو تواصل معنا.`,
      statusLine: "الحالة: غير متاح",
    },
    cancelled: {
      subject: `تم إلغاء حجزك — ${r.code}`,
      heading: "تم إلغاء الحجز",
      intro: `تم إلغاء حجزك في ${restaurant}. إن كان ذلك عن طريق الخطأ، تواصل معنا لإعادة الحجز.`,
      statusLine: "الحالة: ملغى",
    },
    labels: { ref: "المرجع", date: "التاريخ", time: "الوقت", guests: "عدد الضيوف", contact: "تواصل معنا" },
  };
  return lang === "ar" ? ar : en;
}

function emailHtml(event: Event, lang: Lang, r: ResData, restaurant: string, phone: string) {
  const c = copy(event, lang, r, restaurant);
  const e = c[event];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#7a6a58;font-size:14px">${label}</td><td style="padding:6px 0;color:#120b07;font-weight:600;font-size:14px;text-align:${
      lang === "ar" ? "left" : "right"
    }">${value}</td></tr>`;
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#f5efe3;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:28px 20px">
    <div style="text-align:center;color:#d9a441;font-weight:700;letter-spacing:2px;font-size:12px">${restaurant.toUpperCase()}</div>
    <div style="background:#fbf7ef;border:1px solid rgba(23,18,14,.12);border-radius:16px;padding:28px;margin-top:16px">
      <h1 style="margin:0 0 8px;color:#120b07;font-size:22px">${e.heading}</h1>
      <p style="margin:0 0 18px;color:#4a3a2c;font-size:15px;line-height:1.6">${e.intro}</p>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid rgba(23,18,14,.12);border-bottom:1px solid rgba(23,18,14,.12)">
        ${row(c.labels.ref, r.code)}
        ${row(c.labels.date, fmtDate(r.date, lang))}
        ${row(c.labels.time, fmtTime(r.time, lang))}
        ${row(c.labels.guests, String(r.guestCount))}
      </table>
      <p style="margin:16px 0 0;color:#d9a441;font-weight:700;font-size:14px">${e.statusLine}</p>
      <p style="margin:18px 0 0;color:#7a6a58;font-size:13px">${c.labels.contact}: ${phone}</p>
    </div>
  </div></body></html>`;
}

function whatsappText(event: Event, lang: Lang, r: ResData, restaurant: string, phone: string) {
  const c = copy(event, lang, r, restaurant);
  const e = c[event];
  return [
    `*${restaurant}*`,
    "",
    e.heading,
    e.intro,
    "",
    `${c.labels.ref}: ${r.code}`,
    `${c.labels.date}: ${fmtDate(r.date, lang)}`,
    `${c.labels.time}: ${fmtTime(r.time, lang)}`,
    `${c.labels.guests}: ${r.guestCount}`,
    e.statusLine,
    "",
    `${c.labels.contact}: ${phone}`,
  ].join("\n");
}

// ---------- providers (fetch-only, no SDK dependency) ----------
async function sendEmail(to: string, subject: string, html: string): Promise<NotifyStatus> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATION_FROM_EMAIL;
  if (!key || !from) return "SKIPPED";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok ? "SENT" : "FAILED";
  } catch {
    return "FAILED";
  }
}

async function sendWhatsApp(toPhone: string, body: string): Promise<NotifyStatus> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return "SKIPPED";
  const to = toPhone.replace(/[^\d]/g, "");
  if (!to) return "FAILED";
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      // Free-form text works inside the 24h service window / for test numbers.
      // Business-initiated messages outside that window require an approved
      // template; wire WHATSAPP template names here when available.
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
    });
    return res.ok ? "SENT" : "FAILED";
  } catch {
    return "FAILED";
  }
}

// ---------- public API ----------
export async function notifyCustomer(
  event: Event,
  r: ResData
): Promise<{ emailStatus: NotifyStatus; whatsappStatus: NotifyStatus }> {
  const settings = await getSettings();
  const restaurant = settings.businessName || "Bit Bladi";
  const phone = settings.content.contact.phone || "";
  const lang = (r.preferredLanguage === "ar" ? "ar" : "en") as Lang;
  const c = copy(event, lang, r, restaurant);

  const emailStatus = await sendEmail(r.customerEmail, c[event].subject, emailHtml(event, lang, r, restaurant, phone));
  const whatsappStatus = await sendWhatsApp(r.customerPhone, whatsappText(event, lang, r, restaurant, phone));
  return { emailStatus, whatsappStatus };
}

/** Internal heads-up to the restaurant when a new request arrives. Best-effort. */
export async function notifyRestaurant(r: ResData): Promise<void> {
  const to = process.env.RESTAURANT_NOTIFICATION_EMAIL;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATION_FROM_EMAIL;
  if (!to || !key || !from) return;
  const settings = await getSettings();
  const restaurant = settings.businessName || "Bit Bladi";
  const base = process.env.APP_BASE_URL || "";
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5efe3;margin:0">
  <div style="max-width:520px;margin:0 auto;padding:28px 20px">
    <div style="background:#fff;border:1px solid rgba(23,18,14,.12);border-radius:16px;padding:24px">
      <h2 style="margin:0 0 12px;color:#120b07">New reservation request — ${r.code}</h2>
      <p style="margin:4px 0;color:#4a3a2c">Name: <b>${r.customerName}</b></p>
      <p style="margin:4px 0;color:#4a3a2c">Phone: ${r.customerPhone}</p>
      <p style="margin:4px 0;color:#4a3a2c">Email: ${r.customerEmail}</p>
      <p style="margin:4px 0;color:#4a3a2c">Date/Time: ${fmtDate(r.date, "en")} · ${fmtTime(r.time, "en")}</p>
      <p style="margin:4px 0;color:#4a3a2c">Guests: ${r.guestCount}</p>
      ${r.specialRequests ? `<p style="margin:4px 0;color:#4a3a2c">Notes: ${r.specialRequests}</p>` : ""}
      <a href="${base}/admin/reservations" style="display:inline-block;margin-top:14px;background:#d9a441;color:#120b07;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px">Manage in admin</a>
    </div>
  </div></body></html>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `New reservation ${r.code} — ${restaurant}`, html }),
    });
  } catch {
    /* best-effort; restaurant heads-up must never affect the customer flow */
  }
}
