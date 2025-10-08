"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  customerId: string;
  customerName?: string | null;
  onSuccess: () => void;
};

// 最小動作：API ルート /api/customers/[id] を想定（DELETE）
export function DeleteCustomerForm({ customerId, customerName, onSuccess }: Props) {
  const onDelete = async () => {
    const ok = confirm(`「${customerName ?? "この顧客"}」を削除します。よろしいですか？`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
    } catch (e) {
      console.error("[DeleteCustomerForm] failed:", e);
      alert("削除に失敗しました。しばらくしてから再度お試しください。");
    }
  };

  return (
    <Button size="sm" variant="danger" onClick={onDelete}>
      削除
    </Button>
  );
}
