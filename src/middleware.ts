import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * ミドルウェア（認証ガード）
 * Auth.js v5を使用して認証チェックを実行
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのリクエストにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico, sitemap.xml, robots.txt (メタファイル)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
