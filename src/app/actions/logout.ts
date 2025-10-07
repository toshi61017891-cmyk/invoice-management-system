"use server";

import { signOut } from "@/auth";

/**
 * ログアウト処理（Server Action）
 */
export async function logout() {
  await signOut({ redirectTo: "/login" });
}

