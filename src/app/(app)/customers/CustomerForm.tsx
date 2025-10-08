"use client";

import { useState } from "react";
import type { Customer } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

type Props = {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
};

// 最小動作：API ルート /api/customers を想定（なければ後で差し替え）
export function CustomerForm({ customer, onClose, onSuccess }: Props) {
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(customer?.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `/api/customers/${customer!.id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
    } catch (err) {
      console.error("[CustomerForm] submit failed:", err);
      alert("保存に失敗しました。入力内容をご確認ください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardBody>
          <h2 className="mb-4 text-xl font-semibold">{isEdit ? "顧客を編集" : "新規顧客を作成"}</h2>
          <form onSubmit={submit} className="space-y-3">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="顧客名 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="メールアドレス"
              type="email"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="電話番号"
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="住所"
              value={address ?? ""}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
