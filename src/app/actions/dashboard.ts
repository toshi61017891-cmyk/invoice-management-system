"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/auth";

/**
 * ダッシュボードのKPIデータを取得
 */
export async function getDashboardKPI() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 今月の日付範囲
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 請求書の集計
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        payments: {
          where: { status: "RECONCILED" },
        },
      },
    });

    // 今月の請求書
    const monthlyInvoices = invoices.filter(
      (inv) =>
        inv.issuedAt &&
        new Date(inv.issuedAt) >= startOfMonth &&
        new Date(inv.issuedAt) <= endOfMonth,
    );

    // 今月の売上（請求金額の合計）
    const monthlySales = monthlyInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    // 今月の入金額
    const payments = await prisma.payment.findMany({
      where: {
        userId,
        status: "RECONCILED",
        paidAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    // 未収金（送付済み・期限切れで未払いの請求書の合計）
    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === "SENT" || inv.status === "OVERDUE",
    );

    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => {
      const paidAmount = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + (Number(inv.total) - paidAmount);
    }, 0);

    // 期限切れの請求書
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: {
          in: ["SENT", "OVERDUE"],
        },
        dueDate: {
          lt: now,
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5, // 上位5件
    });

    // 顧客数
    const customerCount = await prisma.customer.count({
      where: { userId },
    });

    // ステータス別の請求書数
    const statusCounts = {
      draft: invoices.filter((inv) => inv.status === "DRAFT").length,
      sent: invoices.filter((inv) => inv.status === "SENT").length,
      overdue: invoices.filter((inv) => inv.status === "OVERDUE").length,
      paid: invoices.filter((inv) => inv.status === "PAID").length,
    };

    return {
      success: true,
      data: {
        monthlySales,
        monthlyPayments,
        totalUnpaid,
        customerCount,
        statusCounts,
        overdueInvoices,
      },
    };
  } catch (error) {
    console.error("ダッシュボードKPI取得エラー:", error);
    return { success: false, error: "KPIデータの取得に失敗しました" };
  }
}

/**
 * 最近のアクティビティを取得
 */
export async function getRecentActivities() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 最近の見積
    const recentQuotes = await prisma.quote.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // 最近の請求書
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // 最近の入金
    const recentPayments = await prisma.payment.findMany({
      where: { userId },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 3,
    });

    return {
      success: true,
      data: {
        recentQuotes,
        recentInvoices,
        recentPayments,
      },
    };
  } catch (error) {
    console.error("最近のアクティビティ取得エラー:", error);
    return { success: false, error: "アクティビティの取得に失敗しました" };
  }
}
