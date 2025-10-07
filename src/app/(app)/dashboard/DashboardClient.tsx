"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Invoice, Customer, Quote, Payment } from "@prisma/client";

type InvoiceWithCustomer = Invoice & { customer: Customer };
type QuoteWithCustomer = Quote & { customer: Customer };
type PaymentWithInvoice = Payment & { invoice: Invoice & { customer: Customer } };

interface DashboardClientProps {
  kpi: {
    monthlySales: number;
    monthlyPayments: number;
    totalUnpaid: number;
    customerCount: number;
    statusCounts: {
      draft: number;
      sent: number;
      overdue: number;
      paid: number;
    };
    overdueInvoices: InvoiceWithCustomer[];
  };
  activities: {
    recentQuotes: QuoteWithCustomer[];
    recentInvoices: InvoiceWithCustomer[];
    recentPayments: PaymentWithInvoice[];
  };
}

/**
 * ダッシュボードクライアントコンポーネント
 */
export function DashboardClient({ kpi, activities }: DashboardClientProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>今月の売上</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">¥{kpi.monthlySales.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">請求金額の合計</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月の入金</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              ¥{kpi.monthlyPayments.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">確定入金の合計</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>未収金</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-orange-600">
              ¥{kpi.totalUnpaid.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">送付済み・未払い</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>顧客数</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-purple-600">{kpi.customerCount}</p>
            <p className="text-sm text-gray-500 mt-1">登録顧客</p>
          </CardBody>
        </Card>
      </div>

      {/* ステータス概要 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>請求書ステータス</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{kpi.statusCounts.draft}</p>
              <p className="text-sm text-gray-500">下書き</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{kpi.statusCounts.sent}</p>
              <p className="text-sm text-gray-500">送付済み</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{kpi.statusCounts.overdue}</p>
              <p className="text-sm text-gray-500">期限切れ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{kpi.statusCounts.paid}</p>
              <p className="text-sm text-gray-500">支払済み</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 期限切れアラート */}
      {kpi.overdueInvoices.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              ⚠️ 期限切れの請求書 ({kpi.overdueInvoices.length}件)
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {kpi.overdueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between bg-white p-3 rounded border border-red-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">{invoice.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">¥{invoice.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      期限: {new Date(invoice.dueDate).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/invoices?status=OVERDUE"
              className="mt-4 inline-block text-sm text-red-600 hover:text-red-700 font-medium"
            >
              すべての期限切れ請求書を確認 →
            </Link>
          </CardBody>
        </Card>
      )}

      {/* 最近のアクティビティ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近の見積 */}
        <Card>
          <CardHeader>
            <CardTitle>最近の見積</CardTitle>
          </CardHeader>
          <CardBody>
            {activities.recentQuotes.length === 0 ? (
              <p className="text-sm text-gray-500">データがありません</p>
            ) : (
              <div className="space-y-3">
                {activities.recentQuotes.map((quote) => (
                  <div key={quote.id} className="pb-3 border-b last:border-0">
                    <p className="font-medium text-sm">{quote.quoteNumber}</p>
                    <p className="text-xs text-gray-600">{quote.customer.name}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ¥{quote.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/quotes"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              すべて表示 →
            </Link>
          </CardBody>
        </Card>

        {/* 最近の請求書 */}
        <Card>
          <CardHeader>
            <CardTitle>最近の請求書</CardTitle>
          </CardHeader>
          <CardBody>
            {activities.recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500">データがありません</p>
            ) : (
              <div className="space-y-3">
                {activities.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="pb-3 border-b last:border-0">
                    <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-600">{invoice.customer.name}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ¥{invoice.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/invoices"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              すべて表示 →
            </Link>
          </CardBody>
        </Card>

        {/* 最近の入金 */}
        <Card>
          <CardHeader>
            <CardTitle>最近の入金</CardTitle>
          </CardHeader>
          <CardBody>
            {activities.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500">データがありません</p>
            ) : (
              <div className="space-y-3">
                {activities.recentPayments.map((payment) => (
                  <div key={payment.id} className="pb-3 border-b last:border-0">
                    <p className="font-medium text-sm">{payment.invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-600">{payment.invoice.customer.name}</p>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ¥{payment.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/payments"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              すべて表示 →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
