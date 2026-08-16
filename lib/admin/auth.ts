import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "ltps_admin";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function adminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SECRET");
  }
  return secret;
}

export function adminSessionToken() {
  return createHmac("sha256", adminSecret())
    .update("ltps-admin-session")
    .digest("hex");
}

function equal(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminSecret(secret: string) {
  try {
    return equal(secret, adminSecret());
  } catch {
    return false;
  }
}

export async function hasAdminCookie() {
  try {
    const value = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
    if (!value) {
      return false;
    }
    return equal(value, adminSessionToken());
  } catch {
    return false;
  }
}

export function hasAdminBearer(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return false;
  }
  return isValidAdminSecret(header.slice("Bearer ".length));
}

export async function isAdminRequest(request?: Request) {
  if (request && hasAdminBearer(request)) {
    return true;
  }
  return hasAdminCookie();
}

export async function setAdminCookie() {
  (await cookies()).set(ADMIN_COOKIE_NAME, adminSessionToken(), COOKIE_OPTIONS);
}

export async function clearAdminCookie() {
  (await cookies()).delete(ADMIN_COOKIE_NAME);
}
