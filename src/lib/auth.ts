import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "bb_session";
const DEV_DEFAULT = "dev-only-change-me-32chars-minimum-secret";

// Resolve the signing key at call time (not module load, so `next build` never
// crashes on a missing env). In production a missing / default / too-short
// AUTH_SECRET is fatal: signing throws (no one can log in) and verification
// fails closed (no forged token is accepted) — never a silent bypass.
function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!s || s === DEV_DEFAULT || s.length < 32) {
      throw new Error(
        "AUTH_SECRET must be set to a strong, unique value (>=32 chars) in production."
      );
    }
    return new TextEncoder().encode(s);
  }
  return new TextEncoder().encode(s || DEV_DEFAULT);
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

// Edge-safe (jose only). Used by middleware + server.
export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    // Invalid token, expired, or (in prod) a misconfigured secret — fail closed.
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  return verifySessionToken(c.get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;
