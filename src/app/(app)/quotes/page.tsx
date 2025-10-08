/**
 * 見積管理画面
 */

import { getQuotes } from "@/app/actions/quotes";
import { QuotesClient } from "./QuotesClient";
import type { QuoteStatus } from "@prisma/client";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: QuoteStatus }>;
}) {
  const params = await searchParams;

  // フィルター後のデータ
  const result = await getQuotes(params.status);
  const quotes = (result as any)?.data ?? [];

  // 全件データ（件数計算用）
  const allResult = await getQuotes();
  const allQuotes = (allResult as any)?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">見積管理</h1>
      </div>

      <QuotesClient initialQuotes={quotes} allQuotes={allQuotes} currentStatus={params.status} />
    </div>
  );
}
