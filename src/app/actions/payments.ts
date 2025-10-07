"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/auth";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

/**
 * 入金一覧を取得（フィルター・検索対応）
 */
export async function getPayments(status?: string, search?: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId,
        ...(status && status !== "" && { status: status as PaymentStatus }),
        ...(search && {
          OR: [
            { invoice: { invoiceNumber: { contains: search } } },
            { invoice: { customer: { name: { contains: search } } } },
          ],
        }),
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
    });

    return { success: true, data: payments };
  } catch (error) {
    console.error("入金一覧取得エラー:", error);
    return { success: false, error: "入金一覧の取得に失敗しました" };
  }
}

/**
 * 新規入金を登録
 */
export async function createPayment(data: {
  invoiceId: string;
  amount: number;
  paidAt: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 請求書の存在確認
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, userId },
    });

    if (!invoice) {
      return { success: false, error: "請求書が見つかりません" };
    }

    // 入金を作成
    const payment = await prisma.payment.create({
      data: {
        ...data,
        userId,
      },
    });

    // 入金が消込済みの場合、請求書のステータスを更新
    if (data.status === "RECONCILED") {
      // 請求書の合計金額と入金額を比較
      const totalPayments = await prisma.payment.aggregate({
        where: {
          invoiceId: data.invoiceId,
          status: "RECONCILED",
        },
        _sum: {
          amount: true,
        },
      });

      const totalPaid = Number(totalPayments._sum.amount || 0);
      const invoiceTotal = Number(invoice.total);

      // 全額入金済みの場合、請求書を「支払済み」に更新
      if (totalPaid >= invoiceTotal) {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: "PAID" },
        });
      }
    }

    revalidatePath("/payments");
    revalidatePath("/invoices");
    return { success: true, data: payment };
  } catch (error) {
    console.error("入金登録エラー:", error);
    return { success: false, error: "入金の登録に失敗しました" };
  }
}

/**
 * 入金情報を更新
 */
export async function updatePayment(
  paymentId: string,
  data: {
    amount?: number;
    paidAt?: Date;
    method?: PaymentMethod;
    status?: PaymentStatus;
    notes?: string;
  },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 入金の存在確認
    const existingPayment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { invoice: true },
    });

    if (!existingPayment) {
      return { success: false, error: "入金情報が見つかりません" };
    }

    // 入金を更新
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data,
    });

    // ステータスが変更された場合、請求書のステータスを再計算
    if (data.status !== undefined) {
      const totalPayments = await prisma.payment.aggregate({
        where: {
          invoiceId: existingPayment.invoiceId,
          status: "RECONCILED",
        },
        _sum: {
          amount: true,
        },
      });

      const totalPaid = Number(totalPayments._sum.amount || 0);
      const invoiceTotal = Number(existingPayment.invoice.total);

      // 全額入金済みかチェック
      if (totalPaid >= invoiceTotal) {
        await prisma.invoice.update({
          where: { id: existingPayment.invoiceId },
          data: { status: "PAID" },
        });
      } else if (existingPayment.invoice.status === "PAID") {
        // 支払済みだったが、入金が減った場合は送付済みに戻す
        await prisma.invoice.update({
          where: { id: existingPayment.invoiceId },
          data: { status: "SENT" },
        });
      }
    }

    revalidatePath("/payments");
    revalidatePath("/invoices");
    return { success: true, data: payment };
  } catch (error) {
    console.error("入金更新エラー:", error);
    return { success: false, error: "入金の更新に失敗しました" };
  }
}

/**
 * 入金を削除
 */
export async function deletePayment(paymentId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 入金の存在確認
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { invoice: true },
    });

    if (!payment) {
      return { success: false, error: "入金情報が見つかりません" };
    }

    // 入金を削除
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    // 請求書のステータスを再計算
    const totalPayments = await prisma.payment.aggregate({
      where: {
        invoiceId: payment.invoiceId,
        status: "RECONCILED",
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaid = Number(totalPayments._sum.amount || 0);
    const invoiceTotal = Number(payment.invoice.total);

    if (totalPaid >= invoiceTotal) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" },
      });
    } else if (payment.invoice.status === "PAID") {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "SENT" },
      });
    }

    revalidatePath("/payments");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("入金削除エラー:", error);
    return { success: false, error: "入金の削除に失敗しました" };
  }
}

/**
 * 請求書IDから入金可能な情報を取得
 */
export async function getInvoiceForPayment(invoiceId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        customer: true,
        payments: {
          where: { status: "RECONCILED" },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "請求書が見つかりません" };
    }

    // 既存の入金合計を計算
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    const remaining = Number(invoice.total) - totalPaid;

    return {
      success: true,
      data: {
        invoice,
        totalPaid,
        remaining,
      },
    };
  } catch (error) {
    console.error("請求書取得エラー:", error);
    return { success: false, error: "請求書の取得に失敗しました" };
  }
}
