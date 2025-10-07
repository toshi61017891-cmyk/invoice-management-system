import { getPayments } from "@/app/actions/payments";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/auth";
import { PaymentsClient } from "./PaymentsClient";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; invoiceId?: string }>;
}

/**
 * 入金管理ページ（サーバーコンポーネント）
 */
export default async function PaymentsPage({ searchParams }: PageProps) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const params = await searchParams;
  // 互換: 旧パラメータ値を新定義にマップ
  const statusMap: Record<string, string> = {
    CONFIRMED: "RECONCILED",
    PENDING: "RECORDED",
    FAILED: "CANCELLED",
  };
  const normalizedStatus =
    params.status && statusMap[params.status] ? statusMap[params.status] : params.status;

  const result = await getPayments(normalizedStatus, params.search);

  // 全件取得（ステータスカウント用）
  const allPaymentsResult = await getPayments();

  // 入金可能な請求書を取得（下書き以外）
  const availableInvoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: {
        in: ["SENT", "OVERDUE"],
      },
    },
    include: {
      customer: true,
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  if (!result.success) {
    return (
      <div className="text-red-600">エラー: {result.error || "入金一覧の取得に失敗しました"}</div>
    );
  }

  return (
    <PaymentsClient
      initialPayments={result.data || []}
      allPayments={allPaymentsResult.success ? allPaymentsResult.data || [] : []}
      availableInvoices={availableInvoices}
      initialStatus={normalizedStatus}
      initialSearch={params.search}
      initialInvoiceId={params.invoiceId}
    />
  );
}
