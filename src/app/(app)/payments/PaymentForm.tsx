"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, type PaymentFormData } from "@/schemas/payment";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Invoice, Customer } from "@prisma/client";
import { useEffect, useState } from "react";
import { getInvoiceForPayment } from "@/app/actions/payments";

type InvoiceWithCustomer = Invoice & { customer: Customer };

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  initialData?: Partial<PaymentFormData>;
  availableInvoices: InvoiceWithCustomer[];
  mode: "create" | "edit";
}

/**
 * 入金フォームコンポーネント
 */
export function PaymentForm({ onSubmit, initialData, availableInvoices, mode }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...initialData,
      paidAt: initialData?.paidAt || new Date(),
      method: initialData?.method || "BANK_TRANSFER",
      status: initialData?.status || "RECONCILED",
    },
  });

  const selectedInvoiceId = watch("invoiceId");
  const [invoiceInfo, setInvoiceInfo] = useState<{
    totalPaid: number;
    remaining: number;
  } | null>(null);

  // 請求書が選択されたら、入金情報を取得
  useEffect(() => {
    if (selectedInvoiceId) {
      getInvoiceForPayment(selectedInvoiceId).then((result) => {
        if (result.success && result.data) {
          setInvoiceInfo({
            totalPaid: result.data.totalPaid,
            remaining: result.data.remaining,
          });
          // 新規作成時は残額を入力欄にセット
          if (mode === "create") {
            setValue("amount", result.data.remaining);
          }
        }
      });
    }
  }, [selectedInvoiceId, setValue, mode]);

  const selectedInvoice = availableInvoices.find((inv) => inv.id === selectedInvoiceId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 請求書選択 */}
      <div>
        <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-1">
          請求書 <span className="text-red-500">*</span>
        </label>
        <select
          id="invoiceId"
          {...register("invoiceId")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={mode === "edit" || isSubmitting}
        >
          <option value="">選択してください</option>
          {availableInvoices.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoiceNumber} - {invoice.customer.name} (¥
              {invoice.total.toLocaleString()})
            </option>
          ))}
        </select>
        {errors.invoiceId && (
          <p className="mt-1 text-sm text-red-600">{errors.invoiceId.message}</p>
        )}
      </div>

      {/* 請求書情報表示 */}
      {selectedInvoice && invoiceInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600">請求金額:</span>
              <span className="ml-2 font-semibold">¥{selectedInvoice.total.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">既入金額:</span>
              <span className="ml-2 font-semibold">¥{invoiceInfo.totalPaid.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">未入金額:</span>
              <span className="ml-2 font-semibold text-red-600">
                ¥{invoiceInfo.remaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 入金額 */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          入金額 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input
              id="amount"
              type="number"
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
              value={field.value || ""}
              disabled={isSubmitting}
              placeholder="10000"
            />
          )}
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      {/* 入金日 */}
      <div>
        <label htmlFor="paidAt" className="block text-sm font-medium text-gray-700 mb-1">
          入金日 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="paidAt"
          control={control}
          render={({ field }) => (
            <Input
              id="paidAt"
              type="date"
              {...field}
              value={
                field.value instanceof Date ? field.value.toISOString().split("T")[0] : field.value
              }
              onChange={(e) => field.onChange(new Date(e.target.value))}
              disabled={isSubmitting}
            />
          )}
        />
        {errors.paidAt && <p className="mt-1 text-sm text-red-600">{errors.paidAt.message}</p>}
      </div>

      {/* 支払方法 */}
      <div>
        <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
          支払方法 <span className="text-red-500">*</span>
        </label>
        <select
          id="method"
          {...register("method")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="BANK_TRANSFER">銀行振込</option>
          <option value="CREDIT_CARD">クレジットカード</option>
          <option value="CASH">現金</option>
          <option value="OTHER">その他</option>
        </select>
        {errors.method && <p className="mt-1 text-sm text-red-600">{errors.method.message}</p>}
      </div>

      {/* ステータス */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          ステータス <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          {...register("status")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="RECONCILED">消込済み</option>
          <option value="RECORDED">記録済み</option>
          <option value="CANCELLED">キャンセル</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
      </div>

      {/* 備考 */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          備考
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
          placeholder="備考を入力..."
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "登録中..." : mode === "create" ? "登録" : "更新"}
        </Button>
      </div>
    </form>
  );
}
