"use client";

import { logout } from "@/app/actions/logout";

/**
 * ログアウトボタン（Client Component）
 */
export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="text-blue-400 hover:text-blue-300 mt-2 transition-colors"
    >
      ログアウト
    </button>
  );
}
