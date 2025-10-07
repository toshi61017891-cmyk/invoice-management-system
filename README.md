# 請求書管理システム

## 📋 概要

見積・請求・入金管理を行うWebアプリケーションです。

## 🚀 セットアップ手順

### 1. 必要な環境

- Node.js 18以上
- npm または yarn

### 2. インストール

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma migrate dev

# 開発サーバーの起動
npm run dev
```

### 3. アクセス

- URL: http://localhost:3000
- デフォルトユーザー: admin@example.com / password

## 📊 機能一覧

### ✅ 実装済み機能

- **ダッシュボード**: KPI表示、売上グラフ
- **請求管理**: 請求書の作成・編集・削除、PDF出力、メール送信
- **入金管理**: 入金の登録・管理、請求書との連携
- **見積管理**: 見積の作成・管理、請求書への変換
- **顧客管理**: 顧客情報の管理
- **認証**: ユーザー認証、セッション管理

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: SQLite
- **認証**: NextAuth.js
- **PDF生成**: @react-pdf/renderer
- **メール送信**: Resend

## 📁 プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # 認証が必要なページ
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── invoices/      # 請求管理
│   │   ├── payments/      # 入金管理
│   │   ├── quotes/        # 見積管理
│   │   └── customers/     # 顧客管理
│   ├── actions/           # Server Actions
│   └── auth/              # 認証設定
├── components/            # 共通コンポーネント
├── lib/                   # ユーティリティ
└── types/                 # 型定義
```

## 🔧 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # リント実行
npm run db:studio    # Prisma Studio起動
```

## 📝 注意事項

- 本番環境では環境変数の設定が必要です
- メール送信機能はResendのAPIキーが必要です
- データベースはSQLiteを使用（本番ではPostgreSQL推奨）

## 🆘 トラブルシューティング

- エラーが発生した場合は、`npm run db:push`でデータベースを同期してください
- 認証エラーが発生した場合は、`.env`ファイルの設定を確認してください
