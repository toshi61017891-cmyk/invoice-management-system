"use client";

/**
 * 請求書作成フォーム
 *
 * 見積なしで直接請求書を作成するためのフォーム。
 * 複数明細の動的追加・削除、金額の自動計算に対応します。
 */

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { invoiceSchema, type InvoiceFormData } from "@/schemas/invoice";
import { createInvoice, getCustomersForSelect } from "@/app/actions/invoices";

interface InvoiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceForm({ onClose, onSuccess }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      issuedAt: undefined,
      dueDate: undefined,
      notes: "",
      items: [
        {
          name: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // 顧客一覧を取得
  useEffect(() => {
    getCustomersForSelect().then((result) => {
      if (result.success) {
        setCustomers(result.data);
      }
      setIsLoadingCustomers(false);
    });
  }, []);

  // 金額計算（リアルタイム）
  const watchItems = watch("items");
  const subtotal = watchItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const taxRate = 0.1; // 10%
  const tax = Math.floor(subtotal * taxRate);
  const total = subtotal + tax;

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const result = await createInvoice(data);

      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("フォーム送信エラー:", error);
      alert("予期しないエラーが発生しました");
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="新規請求書を作成" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              顧客 <span className="text-red-500">*</span>
            </label>
            {isLoadingCustomers ? (
              <p className="text-sm text-gray-500">読み込み中...</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-red-600">
                顧客が登録されていません。先に顧客を登録してください。
              </p>
            ) : (
              <select
                {...register("customerId")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">選択してください</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            )}
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>

          <Input
            label="発行日"
            type="date"
            {...register("issuedAt")}
            error={errors.issuedAt?.message}
            disabled={isSubmitting}
            required
          />

          <Input
            label="支払期限"
            type="date"
            {...register("dueDate")}
            error={errors.dueDate?.message}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* 明細 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">明細</h3>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                append({
                  name: "",
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                })
              }
              disabled={isSubmitting}
            >
              ＋ 明細を追加
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">明細 {index + 1}</h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isSubmitting}
                    >
                      削除
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="品目名"
                    {...register(`items.${index}.name`)}
                    error={errors.items?.[index]?.name?.message}
                    placeholder="Webサイト制作"
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="説明"
                    {...register(`items.${index}.description`)}
                    error={errors.items?.[index]?.description?.message}
                    placeholder="トップページ + 下層5ページ"
                    disabled={isSubmitting}
                  />

                  <Input
                    label="数量"
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    error={errors.items?.[index]?.quantity?.message}
                    required
                    disabled={isSubmitting}
                  />

                  <Input
                    label="単価"
                    type="number"
                    step="1"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    error={errors.items?.[index]?.unitPrice?.message}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">金額: </span>
                  <span className="font-semibold">
                    ¥
                    {(
                      (Number(watchItems[index]?.quantity) || 0) *
                      (Number(watchItems[index]?.unitPrice) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {errors.items?.root && (
            <p className="mt-2 text-sm text-red-600">{errors.items.root.message}</p>
          )}
        </div>

        {/* 金額サマリー */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">小計:</span>
                <span className="font-medium">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">消費税 (10%):</span>
                <span className="font-medium">¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>合計:</span>
                <span className="text-blue-600">¥{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="その他の注意事項や条件など"
            disabled={isSubmitting}
          />
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        </div>

        {/* アクション */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || customers.length === 0}>
            {isSubmitting ? "作成中..." : "請求書を作成"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
