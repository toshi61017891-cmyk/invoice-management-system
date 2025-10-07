"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/auth";

/**
 * 見積を請求書に変換
 */
export async function convertQuoteToInvoice(quoteId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 見積を取得（明細含む）
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, userId },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quote) {
      return { success: false, error: "見積が見つかりません" };
    }

    if (quote.status !== "ACCEPTED") {
      return { success: false, error: "承認済みの見積のみ請求書に変換できます" };
    }

    // 既に請求書が作成されているかチェック
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quoteId },
    });

    if (existingInvoice) {
      return { success: false, error: "この見積は既に請求書に変換されています" };
    }

    // 請求書番号を自動生成（INV-YYYYMMDD-XXX形式）
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayInvoices = await prisma.invoice.count({
      where: {
        userId,
        invoiceNumber: {
          startsWith: `INV-${dateStr}`,
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(todayInvoices + 1).padStart(3, "0")}`;

    // 支払期限を設定（発行日から30日後）
    const issuedAt = new Date();
    const dueDate = new Date(issuedAt);
    dueDate.setDate(dueDate.getDate() + 30);

    // 請求書を作成
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: "DRAFT",
        issuedAt,
        dueDate,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        notes: quote.notes,
        userId,
        customerId: quote.customerId,
        quoteId: quote.id,
        items: {
          create: quote.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
    });

    revalidatePath("/invoices");
    revalidatePath("/quotes");
    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("請求書変換エラー:", error);
    return { success: false, error: "請求書の作成に失敗しました" };
  }
}

/**
 * 請求書一覧を取得
 */
export async function getInvoices(status?: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices;
  } catch (error) {
    console.error("請求書取得エラー:", error);
    return [];
  }
}

/**
 * 請求書のステータスを更新
 */
export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      return { success: false, error: "請求書が見つかりません" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: status as any },
    });

    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("ステータス更新エラー:", error);
    return { success: false, error: "ステータスの更新に失敗しました" };
  }
}

/**
 * 請求書を削除
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    await prisma.invoice.delete({
      where: {
        id: invoiceId,
        userId,
      },
    });

    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("請求書削除エラー:", error);
    return { success: false, error: "請求書の削除に失敗しました" };
  }
}

/**
 * 請求書を直接作成（見積なし）
 */
export async function createInvoice(data: {
  customerId: string;
  issuedAt: string;
  dueDate: string;
  notes?: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 請求書番号を自動生成（INV-YYYYMMDD-XXX形式）
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const todayInvoices = await prisma.invoice.count({
      where: {
        userId,
        invoiceNumber: {
          startsWith: `INV-${dateStr}`,
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(todayInvoices + 1).padStart(3, "0")}`;

    // 金額計算
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxRate = 0.1;
    const tax = Math.floor(subtotal * taxRate);
    const total = subtotal + tax;

    // 請求書を作成
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: "DRAFT",
        issuedAt: new Date(data.issuedAt),
        dueDate: new Date(data.dueDate),
        subtotal,
        tax,
        total,
        notes: data.notes,
        userId,
        customerId: data.customerId,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("請求書作成エラー:", error);
    return { success: false, error: "請求書の作成に失敗しました" };
  }
}

/**
 * 顧客選択用の一覧を取得
 */
export async function getCustomersForSelect() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, data: [] };
    }

    const customers = await prisma.customer.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error("顧客一覧取得エラー:", error);
    return { success: false, data: [] };
  }
}
