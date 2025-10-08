/**
 * Prismaクライアント初期化
 *
 * Next.jsの開発モード（ホットリロード）でも
 * Prismaクライアントのインスタンスが増えすぎないように管理します。
 */

import { PrismaClient } from "@prisma/client";

// Vercelのビルド時（production+VERCEL）にはDB接続を行わない
let prisma: PrismaClient;
if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
  prisma = new Proxy({} as PrismaClient, {
    get() {
      throw new Error("Prisma client is not available during build time");
    },
  });
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };
