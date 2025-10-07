import { redirect } from "next/navigation";

/**
 * トップページ
 *
 * ダッシュボードへ自動リダイレクトします。
 */
export default function Home() {
  redirect("/dashboard");
}
