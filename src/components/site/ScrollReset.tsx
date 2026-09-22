"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Force scroll position 0 on every route change that has no hash target.
 *
 * Next's App Router scrolls the new route's <main> into view rather than to
 * window-top, which (with the sticky navbar) leaves the page ~80px down. That
 * breaks "Home always returns to the very top". Next performs that scroll in
 * an effect after commit, so we correct it on the next frame — after Next has
 * run. Hash navigations are left untouched so section links still land on
 * their target (offset by `scroll-mt`).
 */
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    const id = requestAnimationFrame(() => {
      if (!window.location.hash) window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}
