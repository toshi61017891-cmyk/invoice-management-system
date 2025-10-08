/**
 * 顧客管理画面
 *
 * 顧客の一覧表示、検索、作成、編集、削除を行います。
 */

import { getCustomers } from "@/app/actions/customers";
import { CustomersClient } from "./CustomersClient";

// Next.js 14/15 どちらでも耐える union の型
type SearchParamsInput =
  | { search?: string | string[] }
  | Promise<{ search?: string | string[] }>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  // Promise でも平値でも OK にする
  const sp = await Promise.resolve(searchParams as any);

  // string | string[] | undefined を単一 string | undefined に正規化
  const search =
    typeof sp?.search === "string"
      ? sp.search
      : Array.isArray(sp?.search)
      ? sp.search[0]
      : undefined;

  const result = await getCustomers(search);
  const customers = result?.success ? result.data : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">顧客管理</h1>
      </div>

      <CustomersClient
        initialCustomers={customers}
        initialSearch={search}
      />
    </div>
  );
}
