"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem } from "./types";

type CartState = {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (item) =>
        set((s) => {
          const existing = s.lines.find((l) => l.id === item.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                id: item.id,
                nameEn: item.nameEn,
                nameAr: item.nameAr,
                price: item.price,
                image: item.image,
                quantity: 1,
              },
            ],
          };
        }),
      increment: (id) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity + 1 } : l)),
        })),
      decrement: (id) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.id === id ? { ...l, quantity: l.quantity - 1 } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.price * l.quantity, 0),
    }),
    { name: "bitbladi-cart" }
  )
);

// SSR-safe hydration guard: false during SSR/first paint, true once on client.
import { useSyncExternalStore } from "react";
const noopSubscribe = () => () => {};
export function useHydratedCart() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
