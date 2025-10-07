import { LoginForm } from "./LoginForm";

/**
 * ログインページ
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 請求書SaaS</h1>
          <p className="text-gray-600">見積・請求・入金管理システム</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">ログイン</h2>
          <LoginForm />
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>デモアカウント: demo@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
