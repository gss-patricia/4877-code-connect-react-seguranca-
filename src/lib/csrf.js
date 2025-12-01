import { cookies } from "next/headers";

export function createCSRFToken() {
  return crypto.randomUUID();
}

export async function setCSRFCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function getCSRFCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("csrf-token")?.value || "";
}

/**
 * Endpoint helper para obter o token (usado pelo frontend)
 */
export async function getCSRFToken() {
  return await getCSRFCookie();
}
