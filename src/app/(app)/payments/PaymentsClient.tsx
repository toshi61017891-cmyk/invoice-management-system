"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Payment, Invoice, Customer } from "@prisma/client";
import { Card, CardBody, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { PaymentForm } from "./PaymentForm";
import { createPayment, updatePayment, deletePayment } from "@/app/actions/payments";
import type { PaymentFormData } from "@/schemas/payment";

type PaymentWithRelations = Payment & {
  invoice: Invoice & {
    customer: Customer;
  };
};

type InvoiceWithCustomer = Invoice & { customer: Customer };

interface PaymentsClientProps {
  initialPayments: PaymentWithRelations[];
  allPayments: PaymentWithRelations[];
  availableInvoices: InvoiceWithCustomer[];
  initialStatus?: string;
  initialSearch?: string;
  initialInvoiceId?: string;
}

/**
 * ステータスの日本語ラベル
 */
const statusLabels: Record<string, string> = {
  RECORDED: "記録済み",
  RECONCILED: "消込済み",
  CANCELLED: "キャンセル",
};

/**
 * 支払方法の日本語ラベル
 */
const methodLabels: Record<string, string> = {
  BANK_TRANSFER: "銀行振込",
  CREDIT_CARD: "クレジットカード",
  CASH: "現金",
  OTHER: "その他",
};

/**
 * ステータスのバッジバリアント
 */
const statusVariants: Record<string, "gray" | "blue" | "green" | "yellow" | "red"> = {
  RECORDED: "gray",
  RECONCILED: "green",
  CANCELLED: "red",
};

/**
 * 入金管理クライアントコンポーネント
 */
export function PaymentsClient({
  initialPayments,
  allPayments,
  availableInvoices,
  initialStatus = "",
  initialSearch = "",
  initialInvoiceId,
}: PaymentsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentWithRelations | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>(initialInvoiceId);

  // 請求書IDが指定されている場合、モーダルを自動で開く
  useEffect(() => {
    if (initialInvoiceId && availableInvoices.some((inv) => inv.id === initialInvoiceId)) {
      setSelectedInvoiceId(initialInvoiceId);
      setIsCreateModalOpen(true);
    }
  }, [initialInvoiceId, availableInvoices]);

  // 全件データから各ステータスの件数を計算（フィルターに関係なく固定）
  const statusCounts: Record<string, number> = {
    "": allPayments.length,
    RECORDED: allPayments.filter((pay) => pay.status === "RECORDED").length,
    RECONCILED: allPayments.filter((pay) => pay.status === "RECONCILED").length,
    CANCELLED: allPayments.filter((pay) => pay.status === "CANCELLED").length,
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (search) params.set("search", search);
    router.push(`/payments?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    if (value) params.set("search", value);
    router.push(`/payments?${params.toString()}`);
  };

  const handleCreate = async (data: PaymentFormData) => {
    const result = await createPayment(data);
    if (result.success) {
      setIsCreateModalOpen(false);
      router.refresh();
    } else {
      alert(result.error || "登録に失敗しました");
    }
  };

  const handleEdit = (payment: PaymentWithRelations) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: PaymentFormData) => {
    if (!editingPayment) return;

    const result = await updatePayment(editingPayment.id, data);
    if (result.success) {
      setIsEditModalOpen(false);
      setEditingPayment(null);
      router.refresh();
    } else {
      alert(result.error || "更新に失敗しました");
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`請求書「${invoiceNumber}」の入金記録を削除してもよろしいですか？`)) {
      return;
    }

    const result = await deletePayment(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "削除に失敗しました");
    }
  };

  return (
    <>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入金管理</h1>
          <p className="mt-1 text-sm text-gray-500">入金の登録・管理・請求書との突合</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>＋ 新規入金</Button>
      </div>

      {/* ステータスフィルター */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange("")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === ""
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              すべて ({statusCounts[""]})
            </button>
            <button
              onClick={() => handleFilterChange("RECONCILED")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "RECONCILED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              消込済み ({statusCounts["RECONCILED"]})
            </button>
            <button
              onClick={() => handleFilterChange("RECORDED")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "RECORDED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              記録済み ({statusCounts["RECORDED"]})
            </button>
            <button
              onClick={() => handleFilterChange("CANCELLED")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "CANCELLED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              キャンセル ({statusCounts["CANCELLED"]})
            </button>
          </div>
        </CardBody>
      </Card>

      {/* 検索バー */}
      <Card className="mb-6">
        <CardBody>
          <Input
            type="text"
            placeholder="請求書番号または顧客名で検索..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </CardBody>
      </Card>

      {/* 入金一覧テーブル */}
      <Card>
        {initialPayments.length === 0 ? (
          <EmptyState
            icon="💰"
            title="入金記録がありません"
            description="「＋ 新規入金」ボタンから入金を登録してください。"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableHead className="w-28">入金日</TableHead>
              <TableHead className="w-44">請求書番号</TableHead>
              <TableHead className="w-56">顧客名</TableHead>
              <TableHead className="w-32 text-right">入金額</TableHead>
              <TableHead className="w-28">支払方法</TableHead>
              <TableHead className="w-28">ステータス</TableHead>
              <TableHead className="">備考</TableHead>
              <TableHead className="w-28 text-right">操作</TableHead>
            </TableHeader>
            <TableBody>
              {initialPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <time>{new Date(payment.paidAt).toLocaleDateString("ja-JP")}</time>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">
                      {payment.invoice.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.invoice.customer.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">¥{payment.amount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">{methodLabels[payment.method]}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[payment.status]}>
                      {statusLabels[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 truncate max-w-xs">
                      {payment.notes || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(payment)}>
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(payment.id, payment.invoice.invoiceNumber)}
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
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedInvoiceId(undefined);
        }}
        title="新規入金登録"
      >
        <PaymentForm
          onSubmit={handleCreate}
          availableInvoices={availableInvoices}
          mode="create"
          initialData={selectedInvoiceId ? { invoiceId: selectedInvoiceId } : undefined}
        />
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPayment(null);
        }}
        title="入金情報編集"
      >
        {editingPayment && (
          <PaymentForm
            onSubmit={handleUpdate}
            initialData={{
              invoiceId: editingPayment.invoiceId,
              amount: Number(editingPayment.amount),
              paidAt: new Date(editingPayment.paidAt),
              method: editingPayment.method,
              status: editingPayment.status,
              notes: editingPayment.notes || undefined,
            }}
            availableInvoices={[
              ...availableInvoices,
              editingPayment.invoice, // 編集中の請求書も含める
            ]}
            mode="edit"
          />
        )}
      </Modal>
    </>
  );
}
