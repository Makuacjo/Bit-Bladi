"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useHydratedCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { formatPrice } from "@/lib/format";
import { localizedName, type DeliveryDetails, type OrderConfig } from "@/lib/types";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { validateCart } from "@/app/actions";
import type { Lang, Dict } from "@/lib/i18n";

const emptyDetails: DeliveryDetails = {
  name: "",
  phone: "",
  area: "",
  building: "",
  room: "",
  floor: "",
  notes: "",
};

export function CartDrawer({
  lang,
  dict,
  config,
}: {
  lang: Lang;
  dict: Dict;
  config: OrderConfig;
}) {
  const { cartOpen, closeCart, view, setView } = useUI();
  const hydrated = useHydratedCart();
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  const [details, setDetails] = useState<DeliveryDetails>(emptyDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [orderUrl, setOrderUrl] = useState("");
  const [invalidIds, setInvalidIds] = useState<string[]>([]);

  const rtl = lang === "ar";

  const invalidNames = (invalid: { nameEn: string; nameAr: string }[]) =>
    invalid.map((i) => (lang === "ar" ? i.nameAr : i.nameEn)).join(lang === "ar" ? "، " : ", ");

  // Proactively re-check availability whenever the drawer opens or lines change,
  // so Sold Out / removed items are flagged before the customer reaches checkout.
  useEffect(() => {
    if (!cartOpen) return;
    let active = true;
    const items = lines.map((l) => ({ id: l.id, quantity: l.quantity }));
    const run = items.length === 0
      ? Promise.resolve({ invalid: [] as { id: string; nameEn: string; nameAr: string }[] })
      : validateCart(items);
    Promise.resolve(run).then((res) => {
      if (!active) return;
      setInvalidIds(res.invalid.map((i) => i.id));
      setErrors((e) => {
        const { cart: _drop, ...rest } = e;
        void _drop;
        return res.invalid.length > 0
          ? { ...rest, cart: `${invalidNames(res.invalid)} ${dict.errors.soldOutInCart}` }
          : rest;
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen, lines]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!details.name.trim()) e.name = dict.errors.name;
    if (!/[0-9]{6,}/.test(details.phone.replace(/[^\d]/g, ""))) e.phone = dict.errors.phone;
    if (!details.area.trim()) e.area = dict.errors.area;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (lines.length === 0) {
      setErrors({ cart: dict.errors.emptyCart });
      return;
    }
    if (!validate()) return;
    setSending(true);

    // Server-side authoritative check: reject sold-out / hidden / missing items
    // and rebuild the order from trusted prices before generating the message.
    const res = await validateCart(lines.map((l) => ({ id: l.id, quantity: l.quantity })));
    if (!res.ok) {
      setSending(false);
      setInvalidIds(res.invalid.map((i) => i.id));
      setView("cart");
      setErrors({ cart: `${invalidNames(res.invalid)} ${dict.errors.soldOutInCart}` });
      return;
    }

    const message = buildOrderMessage(res.lines, details, config, lang);
    const url = whatsappUrl(config.whatsappNumber, message);
    setOrderUrl(url);
    setTimeout(() => {
      setSending(false);
      setView("success");
      window.open(url, "_blank");
      clear();
    }, 900);
  }

  function handleClose() {
    closeCart();
    setTimeout(() => {
      setView("cart");
      setErrors({});
      if (view === "success") setDetails(emptyDetails);
    }, 250);
  }

  const set = (k: keyof DeliveryDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.aside
            className="fixed inset-y-0 z-[71] flex h-full w-full max-w-md flex-col bg-cream shadow-lift"
            style={rtl ? { left: 0 } : { right: 0 }}
            initial={{ x: rtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold text-ink">
                {view === "checkout" ? dict.order.title : view === "success" ? dict.order.ready : dict.cart.title}
              </h2>
              <button
                onClick={handleClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
                aria-label={dict.common.close}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!hydrated ? null : view === "success" ? (
                <SuccessView dict={dict} orderUrl={orderUrl} />
              ) : lines.length === 0 && view === "cart" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand text-muted">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </span>
                  <p className="max-w-xs text-ink-soft">{dict.cart.emptyHint}</p>
                  <button onClick={handleClose} className="btn btn-accent text-sm">
                    {dict.cart.continue}
                  </button>
                </div>
              ) : view === "checkout" ? (
                <CheckoutForm
                  lang={lang}
                  dict={dict}
                  config={config}
                  details={details}
                  set={set}
                  errors={errors}
                  lines={lines}
                  subtotal={subtotal}
                />
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => {
                    const soldOut = invalidIds.includes(l.id);
                    return (
                    <li
                      key={l.id}
                      className={`flex gap-3 rounded-xl border bg-surface p-3 ${
                        soldOut ? "border-accent/50" : "border-line"
                      }`}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {l.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={l.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-display text-xl text-muted/50">
                            {localizedName(l, lang).charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-ink">
                            {localizedName(l, lang)}
                            {soldOut && (
                              <span className="ms-2 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                                {dict.menu.soldOut}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => remove(l.id)}
                            className={`text-xs hover:text-accent ${soldOut ? "font-semibold text-accent" : "text-muted"}`}
                          >
                            {dict.cart.remove}
                          </button>
                        </div>
                        <span className="tnum text-sm text-ink-soft">{formatPrice(l.price, config.currency, lang)}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <QtyControl
                            qty={l.quantity}
                            onDec={() => decrement(l.id)}
                            onInc={() => increment(l.id)}
                            incDisabled={soldOut}
                            label={dict.cart.qty}
                          />
                          <span className="tnum font-semibold text-ink">
                            {formatPrice(l.price * l.quantity, config.currency, lang)}
                          </span>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {hydrated && view !== "success" && lines.length > 0 && (
              <div className="border-t border-line px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-lg">
                  <span className="text-ink-soft">{dict.cart.total}</span>
                  <span className="tnum font-display font-bold text-ink">
                    {formatPrice(subtotal, config.currency, lang)}
                  </span>
                </div>
                {errors.cart && <p className="mb-2 text-sm text-accent">{errors.cart}</p>}
                {view === "cart" ? (
                  <button
                    onClick={() => setView("checkout")}
                    disabled={invalidIds.length > 0}
                    className="btn btn-accent w-full"
                  >
                    {dict.cart.checkout}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setView("cart")} className="btn btn-ghost">
                      {dict.order.back}
                    </button>
                    <button onClick={submit} disabled={sending} className="btn btn-accent flex-1">
                      {sending ? dict.order.sending : dict.order.send}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyControl({
  qty,
  onDec,
  onInc,
  label,
  incDisabled = false,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
  label: string;
  incDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <button
        onClick={onDec}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink hover:border-accent"
        aria-label="decrease"
      >
        −
      </button>
      <span className="tnum w-5 text-center text-sm font-semibold">{qty}</span>
      <button
        onClick={onInc}
        disabled={incDisabled}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

function CheckoutForm({
  lang,
  dict,
  config,
  details,
  set,
  errors,
  lines,
  subtotal,
}: {
  lang: Lang;
  dict: Dict;
  config: OrderConfig;
  details: DeliveryDetails;
  set: (k: keyof DeliveryDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
  lines: { id: string; nameEn: string; nameAr: string; price: number; quantity: number }[];
  subtotal: number;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{dict.order.summary}</h3>
        <ul className="space-y-1 text-sm text-ink-soft">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between">
              <span>{l.quantity} × {localizedName(l, lang)}</span>
              <span>{formatPrice(l.price * l.quantity, config.currency, lang)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
          <span>{dict.cart.total}</span>
          <span>{formatPrice(subtotal, config.currency, lang)}</span>
        </div>
      </div>

      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <Field label={dict.order.name} error={errors.name}>
          <input className="field-input" value={details.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label={dict.order.phone} error={errors.phone}>
          <input className="field-input" value={details.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="+254 7XX XXX XXX" />
        </Field>
        <Field label={dict.order.area} error={errors.area}>
          <input className="field-input" value={details.area} onChange={set("area")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={dict.order.building}>
            <input className="field-input" value={details.building} onChange={set("building")} />
          </Field>
          <Field label={dict.order.room}>
            <input className="field-input" value={details.room} onChange={set("room")} />
          </Field>
        </div>
        <Field label={dict.order.floor}>
          <input className="field-input" value={details.floor} onChange={set("floor")} />
        </Field>
        <Field label={`${dict.order.notes} — ${dict.order.notesHint}`}>
          <textarea className="field-input" rows={2} value={details.notes} onChange={set("notes")} />
        </Field>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
    </label>
  );
}

function SuccessView({ dict, orderUrl }: { dict: Dict; orderUrl: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white"
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </motion.div>
      <p className="font-display text-2xl font-bold text-ink">{dict.order.ready}</p>
      <a href={orderUrl} target="_blank" rel="noreferrer" className="btn btn-accent">
        {dict.order.send}
      </a>
    </div>
  );
}
