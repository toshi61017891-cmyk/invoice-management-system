"use client";

/**
 * 見積管理のクライアントコンポーネント
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Quote, Customer, QuoteItem, QuoteStatus } from "@prisma/client";
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
import { QuoteForm } from "./QuoteForm";
import { deleteQuote, updateQuoteStatus } from "@/app/actions/quotes";
import { convertQuoteToInvoice } from "@/app/actions/invoices";

type QuoteWithRelations = Quote & {
  customer: Customer;
  items: QuoteItem[];
};

interface QuotesClientProps {
  initialQuotes: QuoteWithRelations[];
  allQuotes: QuoteWithRelations[];
  currentStatus?: QuoteStatus;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "下書き",
  SENT: "送信済み",
  ACCEPTED: "承認済み",
  REJECTED: "却下",
};

const STATUS_COLORS: Record<QuoteStatus, "gray" | "blue" | "green" | "red"> = {
  DRAFT: "gray",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
};

export function QuotesClient({ initialQuotes, allQuotes, currentStatus }: QuotesClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const statuses: (QuoteStatus | undefined)[] = [
    undefined,
    "DRAFT",
    "SENT",
    "ACCEPTED",
    "REJECTED",
  ];

  // 全件データから各ステータスの件数を計算（フィルターに関係なく固定）
  const statusCounts = {
    all: allQuotes.length,
    DRAFT: allQuotes.filter((q) => q.status === "DRAFT").length,
    SENT: allQuotes.filter((q) => q.status === "SENT").length,
    ACCEPTED: allQuotes.filter((q) => q.status === "ACCEPTED").length,
    REJECTED: allQuotes.filter((q) => q.status === "REJECTED").length,
  };

  const handleStatusFilter = (status?: QuoteStatus) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    router.push(`/quotes?${params.toString()}`);
  };

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    const result = await updateQuoteStatus(id, newStatus);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "ステータス更新に失敗しました");
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`見積番号「${number}」を削除してもよろしいですか？`)) {
      return;
    }

    const result = await deleteQuote(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "削除に失敗しました");
    }
  };

  const handleConvertToInvoice = async (quoteId: string, quoteNumber: string) => {
    if (!confirm(`見積「${quoteNumber}」を請求書に変換しますか？`)) {
      return;
    }

    const result = await convertQuoteToInvoice(quoteId);
    if (result.success) {
      alert("請求書を作成しました");
      router.push("/invoices");
    } else {
      alert(result.error || "請求書の作成に失敗しました");
    }
  };

  return (
    <>
      {/* ステータスフィルター */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => handleStatusFilter(undefined)}
          className={`px-4 py-2 rounded-lg ${
            !currentStatus
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          すべて ({statusCounts.all})
        </button>
        {statuses.slice(1).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              currentStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {STATUS_LABELS[status!]} ({statusCounts[status!]})
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
          ＋ 新規見積
        </Button>
      </div>

      <Card>
        {initialQuotes.length === 0 ? (
          <CardBody>
            <EmptyState
              icon="📝"
              title="見積データがありません"
              description="「＋ 新規見積」ボタンから見積を作成できます"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)}>最初の見積を作成する</Button>
              }
            />
          </CardBody>
        ) : (
          <Table>
            <TableHeader>
              <TableHead>見積番号</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>発行日</TableHead>
              <TableHead>有効期限</TableHead>
              <TableHead className="text-right">金額（税込）</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableHeader>
            <TableBody>
              {initialQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div className="font-mono font-medium">{quote.quoteNumber}</div>
                  </TableCell>
                  <TableCell>{quote.customer.name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[quote.status]}>
                      {STATUS_LABELS[quote.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quote.issuedAt ? new Date(quote.issuedAt).toLocaleDateString("ja-JP") : "-"}
                  </TableCell>
                  <TableCell>
                    {quote.validUntil
                      ? new Date(quote.validUntil).toLocaleDateString("ja-JP")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ¥{quote.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {quote.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(quote.id, "SENT")}
                        >
                          送信
                        </Button>
                      )}
                      {quote.status === "SENT" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStatusChange(quote.id, "ACCEPTED")}
                          >
                            承認
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStatusChange(quote.id, "REJECTED")}
                          >
                            却下
                          </Button>
                        </>
                      )}
                      {quote.status === "ACCEPTED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConvertToInvoice(quote.id, quote.quoteNumber)}
                        >
                          請求書へ変換
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(quote.id, quote.quoteNumber)}
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
        <QuoteForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
