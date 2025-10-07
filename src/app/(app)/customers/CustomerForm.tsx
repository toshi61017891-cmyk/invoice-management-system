"use client";

/**
 * 顧客作成・編集フォーム
 *
 * React Hook Form + Zodでバリデーション付きフォームを提供します。
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer } from "@prisma/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { customerSchema, type CustomerFormData } from "@/schemas/customer";
import { createCustomer, updateCustomer } from "@/app/actions/customers";

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerForm({ customer, onClose, onSuccess }: CustomerFormProps) {
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const result = isEdit ? await updateCustomer(customer.id, data) : await createCustomer(data);

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
    <Modal isOpen onClose={onClose} title={isEdit ? "顧客情報を編集" : "新規顧客を登録"} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="顧客名"
          {...register("name")}
          error={errors.name?.message}
          placeholder="株式会社サンプル商事"
          required
          disabled={isSubmitting}
        />

        <Input
          label="メールアドレス"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          placeholder="contact@example.com"
          disabled={isSubmitting}
        />

        <Input
          label="電話番号"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="03-1234-5678"
          disabled={isSubmitting}
        />

        <Input
          label="住所"
          {...register("address")}
          error={errors.address?.message}
          placeholder="東京都渋谷区道玄坂1-2-3"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : isEdit ? "更新する" : "登録する"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
