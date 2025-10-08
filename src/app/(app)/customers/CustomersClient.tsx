"use client";

/**
 * 顧客管理のクライアントコンポーネント
 *
 * 検索、作成フォーム、編集、削除などのインタラクティブな機能を提供します。
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@prisma/client";
import { Card, CardBody, EmptyState } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { CustomerForm } from ".";
import { DeleteCustomerForm } from ".";

type CustomersClientProps = {
  // 型差異や取得方法差の影響を受けないように最小要件のみ許容
  initialCustomers: Array<any>;
  initialSearch?: string;
};

export function CustomersClient({ initialCustomers, initialSearch }: CustomersClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState(initialSearch || "");

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    router.push(`/customers?${params.toString()}`);
  };

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingCustomer(null);
    router.refresh();
  };

  return (
    <>
      {/* 画面右上に固定の新規ボタン。スクロールやレイアウトで見失わない */}
      <div className="sticky top-0 z-10 mb-4 flex justify-end bg-gray-50/60 py-2">
        <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
          ＋ 新規
        </Button>
      </div>
      <Card className="mb-6">
        <CardBody>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="顧客名や会社名で検索..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </CardBody>
      </Card>

      <Card>
        {initialCustomers.length === 0 ? (
          <CardBody>
            <EmptyState
              icon="👥"
              title="顧客データがありません"
              description={
                search
                  ? "検索条件に一致する顧客が見つかりませんでした"
                  : "「＋ 新規顧客」ボタンから顧客情報を登録できます"
              }
              action={
                !search && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>最初の顧客を登録する</Button>
                )
              }
            />
          </CardBody>
        ) : (
          <Table>
            <TableHeader>
              <TableHead>顧客名</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>住所</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableHeader>
            <TableBody>
              {initialCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                  </TableCell>
                  <TableCell>
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.phone ? (
                      <a href={`tel:${customer.phone}`} className="hover:underline">
                        {customer.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="max-w-xs truncate">{customer.address}</div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingCustomer(customer)}
                      >
                        編集
                      </Button>
                      <DeleteCustomerForm
                        customerId={customer.id}
                        customerName={customer.name}
                        onSuccess={handleDeleteSuccess}
                      />
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
        <CustomerForm onClose={() => setIsCreateModalOpen(false)} onSuccess={handleFormSuccess} />
      )}

      {/* 編集モーダル */}
      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}
