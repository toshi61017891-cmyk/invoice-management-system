import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * 404エラーページ
 *
 * 存在しないページにアクセスした際に表示されます。
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-4">🔍</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">ページが見つかりません</h2>
        <p className="text-gray-600 mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link href="/dashboard">
          <Button variant="primary" size="lg">
            ダッシュボードへ戻る
          </Button>
        </Link>
      </div>
    </div>
  );
}
