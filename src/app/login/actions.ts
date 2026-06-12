"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, getAuthToken } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");

  if (senha !== process.env.APP_PASSWORD) {
    redirect("/login?erro=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, getAuthToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}
