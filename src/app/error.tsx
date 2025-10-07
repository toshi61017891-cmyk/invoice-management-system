"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/**
 * エラー境界（Error Boundary）
 *
 * アプリケーション全体のエラーをキャッチして表示します。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログを記録（本番ではSentry等に送信）
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">申し訳ございません。予期しないエラーが発生しました。</p>
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-red-800">{error.message}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            もう一度試す
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")} variant="secondary">
            ダッシュボードへ
          </Button>
        </div>
      </div>
    </div>
  );
}
