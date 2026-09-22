import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { locales, defaultLang } from "@/lib/i18n";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin protection ---
  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session && !isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (session && isLogin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set("x-lang", "en");
    return res;
  }

  // --- Public locale routing ---
  const seg = pathname.split("/")[1];
  const isLocale = (locales as readonly string[]).includes(seg);

  if (!isLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLang}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-lang", seg);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.).*)"],
};
