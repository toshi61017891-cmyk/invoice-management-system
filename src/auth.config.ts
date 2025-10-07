import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js 設定
 * Credentialsプロバイダー（メール/パスワード認証）
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnCustomers = nextUrl.pathname.startsWith("/customers");
      const isOnQuotes = nextUrl.pathname.startsWith("/quotes");
      const isOnInvoices = nextUrl.pathname.startsWith("/invoices");
      const isOnPayments = nextUrl.pathname.startsWith("/payments");

      const isProtectedRoute =
        isOnDashboard || isOnCustomers || isOnQuotes || isOnInvoices || isOnPayments;

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // ログインページにリダイレクト
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [], // プロバイダーは auth.ts で追加
} satisfies NextAuthConfig;

