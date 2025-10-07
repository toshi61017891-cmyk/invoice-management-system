"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

/**
 * ログイン処理（Server Action）
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "メールアドレスまたはパスワードが正しくありません";
        default:
          return "認証エラーが発生しました";
      }
    }
    throw error;
  }
}

