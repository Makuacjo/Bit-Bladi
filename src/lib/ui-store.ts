"use client";

import { create } from "zustand";

type View = "cart" | "checkout" | "success";

type UIState = {
  cartOpen: boolean;
  view: View;
  openCart: () => void;
  closeCart: () => void;
  setView: (v: View) => void;
};

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  view: "cart",
  openCart: () => set({ cartOpen: true, view: "cart" }),
  closeCart: () => set({ cartOpen: false }),
  setView: (view) => set({ view }),
}));
