"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Invoice, Customer, InvoiceItem, InvoiceStatus } from "@prisma/client";
import { Card, CardBody, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices";
import { sendInvoiceEmail } from "@/app/actions/email";
import { InvoiceForm } from "./InvoiceForm";

type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItem[];
};

interface InvoicesClientProps {
  initialInvoices: InvoiceWithRelations[];
  allInvoices: InvoiceWithRelations[];
  initialStatus?: string;
}

/**
 * ステータスの日本語ラベル
 */
const statusLabels: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済み",
  OVERDUE: "期限切れ",
  PAID: "支払済み",
};

/**
 * ステータスのバッジバリアント
 */
const statusVariants: Record<string, "gray" | "blue" | "green" | "yellow" | "red"> = {
  DRAFT: "gray",
  SENT: "yellow",
  OVERDUE: "red",
  PAID: "green",
};

/**
 * ステータスフィルター
 */
const statusFilters = [
  { label: "すべて", value: "" },
  { label: "下書き", value: "DRAFT" },
  { label: "送付済み", value: "SENT" },
  { label: "期限切れ", value: "OVERDUE" },
  { label: "支払済み", value: "PAID" },
];

export function InvoicesClient({
  initialInvoices,
  allInvoices,
  initialStatus,
}: InvoicesClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialStatus || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 全件データから各ステータスの件数を計算（フィルターに関係なく固定）
  const statusCounts: Record<string, number> = {
    "": allInvoices.length,
    DRAFT: allInvoices.filter((inv) => inv.status === ("DRAFT" as InvoiceStatus)).length,
    SENT: allInvoices.filter((inv) => inv.status === ("SENT" as InvoiceStatus)).length,
    OVERDUE: allInvoices.filter((inv) => inv.status === ("OVERDUE" as InvoiceStatus)).length,
    PAID: allInvoices.filter((inv) => inv.status === ("PAID" as InvoiceStatus)).length,
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    router.push(`/invoices?${params.toString()}`);
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    const result = await updateInvoiceStatus(invoiceId, newStatus);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "ステータスの更新に失敗しました");
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (
      !confirm(`請求書「${invoiceNumber}」を削除してもよろしいですか？\nこの操作は取り消せません。`)
    ) {
      return;
    }

    const result = await deleteInvoice(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "削除に失敗しました");
    }
  };

  const handleSendEmail = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`請求書「${invoiceNumber}」をメールで送信しますか？`)) {
      return;
    }

    const result = await sendInvoiceEmail(invoiceId);
    if (result.success) {
      alert(result.message || "メールを送信しました");
      router.refresh();
    } else {
      alert(result.error || "メール送信に失敗しました");
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">請求管理</h1>
          <p className="mt-1 text-sm text-gray-500">請求書の作成・送付・管理</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>＋ 新規請求書</Button>
      </div>
      {/* ステータスフィルター */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => handleFilterChange(item.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {item.label} ({(statusCounts as any)[item.value] ?? 0})
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 請求書一覧 */}
      <Card>
        {initialInvoices.length === 0 ? (
          <CardBody>
            <EmptyState
              icon="📄"
              title="請求書がありません"
              description={
                filter
                  ? "指定したステータスの請求書が見つかりませんでした"
                  : "見積を承認後、「請求書へ変換」ボタンから請求書を作成できます"
              }
            />
          </CardBody>
        ) : (
          <Table>
            <TableHeader>
              <TableHead>請求書番号</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>発行日</TableHead>
              <TableHead>支払期限</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableHeader>
            <TableBody>
              {initialInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">{invoice.invoiceNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{invoice.customer.name}</div>
                  </TableCell>
                  <TableCell>
                    <time>
                      {invoice.issuedAt
                        ? new Date(invoice.issuedAt).toLocaleDateString("ja-JP")
                        : "-"}
                    </time>
                  </TableCell>
                  <TableCell>
                    <time
                      className={
                        invoice.dueDate &&
                        new Date(invoice.dueDate) < new Date() &&
                        invoice.status !== "PAID"
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString("ja-JP")
                        : "-"}
                    </time>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">¥{invoice.total.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(invoice.status === ("DRAFT" as InvoiceStatus) ||
                        invoice.status === ("SENT" as InvoiceStatus)) &&
                        invoice.customer.email && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSendEmail(invoice.id, invoice.invoiceNumber)}
                            title="請求書をメールで送信"
                          >
                            📧 送信
                          </Button>
                        )}
                      {(invoice.status === ("SENT" as InvoiceStatus) ||
                        invoice.status === ("OVERDUE" as InvoiceStatus)) && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => router.push(`/payments?invoiceId=${invoice.id}`)}
                          title="この請求書の入金を登録"
                        >
                          💰 入金登録
                        </Button>
                      )}
                      {invoice.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(invoice.id, "SENT")}
                        >
                          送付
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                      >
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 新規作成モーダル */}
      {isCreateModalOpen && (
        <InvoiceForm onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
      )}
    </>
  );
}
