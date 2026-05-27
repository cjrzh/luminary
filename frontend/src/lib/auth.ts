import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "luminary_session";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 90;

export function authConfig() {
  return {
    username: process.env.LUMINARY_AUTH_USERNAME || "admin",
    password: process.env.LUMINARY_AUTH_PASSWORD || "luminary",
    token: process.env.LUMINARY_SESSION_TOKEN || "luminary-dev-session-token-change-me",
  };
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === authConfig().token;
}
