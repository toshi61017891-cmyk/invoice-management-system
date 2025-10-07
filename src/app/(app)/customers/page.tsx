/**
 * 顧客管理画面
 *
 * 顧客の一覧表示、検索、作成、編集、削除を行います。
 */

import { getCustomers } from "@/app/actions/customers";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const result = await getCustomers(params.search);
  const customers = result.success ? result.data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">顧客管理</h1>
      </div>

      <CustomersClient initialCustomers={customers} initialSearch={params.search} />
    </div>
  );
}
