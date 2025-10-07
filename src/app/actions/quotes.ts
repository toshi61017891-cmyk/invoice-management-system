/**
 * 見積管理のServer Actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/schemas/quote";
import type { QuoteStatus } from "@prisma/client";
import { getCurrentUserId } from "@/auth";

/**
 * 見積番号を生成
 */
async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: {
      quoteNumber: {
        startsWith: `QT-${year}-`,
      },
    },
  });
  return `QT-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * 見積一覧を取得
 */
export async function getQuotes(status?: QuoteStatus) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です", data: [] };
    }
    const quotes = await prisma.quote.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: quotes };
  } catch (error) {
    console.error("見積一覧取得エラー:", error);
    return { success: false, error: "見積一覧の取得に失敗しました" };
  }
}

/**
 * 見積を作成
 */
export async function createQuote(data: unknown) {
  try {
    const validated = quoteSchema.parse(data);
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }
    const quoteNumber = await generateQuoteNumber();

    // 金額計算
    const subtotal = validated.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxRate = parseFloat(process.env.APP_DEFAULT_TAX_RATE || "0.1");
    const tax = Math.floor(subtotal * taxRate);
    const total = subtotal + tax;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        status: "DRAFT",
        issuedAt: validated.issuedAt,
        validUntil: validated.validUntil,
        subtotal,
        tax,
        total,
        notes: validated.notes,
        customerId: validated.customerId,
        userId,
        items: {
          create: validated.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    revalidatePath("/quotes");
    return { success: true, data: quote };
  } catch (error) {
    console.error("見積作成エラー:", error);
    return { success: false, error: "見積の作成に失敗しました" };
  }
}

/**
 * 見積のステータスを更新
 */
export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    const quote = await prisma.quote.update({
      where: { id, userId },
      data: { status },
    });

    revalidatePath("/quotes");
    return { success: true, data: quote };
  } catch (error) {
    console.error("見積ステータス更新エラー:", error);
    return { success: false, error: "ステータスの更新に失敗しました" };
  }
}

/**
 * 見積を削除
 */
export async function deleteQuote(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    await prisma.quote.delete({
      where: { id, userId },
    });

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("見積削除エラー:", error);
    return { success: false, error: "見積の削除に失敗しました" };
  }
}

/**
 * 顧客一覧を取得（見積作成時のセレクトボックス用）
 */
export async function getCustomersForSelect() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です", data: [] };
    }

    const customers = await prisma.customer.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error("顧客一覧取得エラー:", error);
    return { success: false, error: "顧客一覧の取得に失敗しました", data: [] };
  }
}
