import crypto from "crypto";

export const AUTH_COOKIE = "gf_auth";

export function getAuthToken(): string {
  const password = process.env.APP_PASSWORD ?? "";
  return crypto.createHash("sha256").update(password).digest("hex");
}
