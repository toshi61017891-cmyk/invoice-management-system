import Link from "next/link";
import type { ReactNode } from "react";
import { SidebarNavLink } from "@/components/SidebarNavLink";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/LogoutButton";

/**
 * アプリケーション内の共通レイアウト
 *
 * サイドバーとヘッダーを含みます。
 * 全ての機能画面（ダッシュボード、顧客、見積、請求、入金）で共有されます。
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen flex">
      {/* サイドバー */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">請求書SaaS</h1>
          <p className="text-sm text-gray-400 mt-1">Invoice Manager</p>
        </div>

        <nav className="space-y-2" aria-label="メインナビゲーション">
          <SidebarNavLink href="/dashboard" icon="📊">
            ダッシュボード
          </SidebarNavLink>
          <SidebarNavLink href="/customers" icon="👥">
            顧客管理
          </SidebarNavLink>
          <SidebarNavLink href="/quotes" icon="📝">
            見積管理
          </SidebarNavLink>
          <SidebarNavLink href="/invoices" icon="📄">
            請求管理
          </SidebarNavLink>
          <SidebarNavLink href="/payments" icon="💰">
            入金管理
          </SidebarNavLink>
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <p className="truncate">
              ユーザー: {session?.user?.name || session?.user?.email || "ゲスト"}
            </p>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {/* ページタイトルは各ページで設定 */}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">🔔 通知</button>
              <button className="text-gray-600 hover:text-gray-900">⚙️ 設定</button>
            </div>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}

// 旧NavLinkはSidebarNavLinkに置き換えました
