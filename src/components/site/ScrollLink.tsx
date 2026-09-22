"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type LinkProps = ComponentProps<typeof Link>;

/**
 * A Link that scrolls reliably to in-page targets.
 *
 * Next's App Router does not re-scroll when you navigate to the URL you're
 * already on — so clicking "Home" (or a hash) from the footer would otherwise
 * do nothing. This wrapper handles the same-page cases itself:
 *   - no hash  -> scroll to the very top (position 0)
 *   - #hash    -> scroll the target into view, offset by the sticky navbar
 * Cross-page navigation is left to Next; the target section's `scroll-mt-*`
 * (plus the global `scroll-padding-top`) keeps its heading clear of the navbar.
 *
 * Modifier-clicks and non-primary buttons fall through to default behaviour so
 * "open in new tab" keeps working.
 */
export function ScrollLink({
  href,
  onNavigate,
  onClick,
  ...rest
}: LinkProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const hrefStr = typeof href === "string" ? href : href.toString();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const [rawPath, hash] = hrefStr.split("#");
    const targetPath = normalize(rawPath || "/");
    if (targetPath !== normalize(pathname)) return; // different route -> let Next navigate

    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        history.replaceState(null, "", `#${hash}`);
      }
    } else {
      window.scrollTo({ top: 0, behavior });
      // Drop any lingering hash so the URL reflects "top of home".
      history.replaceState(null, "", targetPath);
    }
    onNavigate?.();
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}

function normalize(p: string) {
  return p.replace(/\/+$/, "") || "/";
}
