import { getInvoices } from "@/app/actions/invoices";
import { InvoicesClient } from "./InvoicesClient";

/**
 * 請求管理ページ（Server Component）
 */
export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params?.status;

  // フィルター後のデータ
  const invoices = await getInvoices(status);

  // 全件データ（件数計算用）
  const allInvoices = await getInvoices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">請求管理</h1>
      </div>

      <InvoicesClient initialInvoices={invoices} allInvoices={allInvoices} initialStatus={status} />
    </div>
  );
}
