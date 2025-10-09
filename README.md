# 請求書SaaS（見積・請求・入金の最小実装）

ライブURL: https://invoicemanagementsystem-nine.vercel.app  
デモアカウント: `demo@example.com / password`

## 概要
Next.js 15 / React 19 / Prisma / PostgreSQL (Neon) / Vercel で構築した、見積→請求→入金までの最小構成SaaSです。PDF/メールは本番で安全に動くよう、APIキー未設定時はモック挙動に切り替わります。

## 主な機能
- 顧客管理（検索・作成・編集・削除）
- 見積管理（作成・編集・請求書へ変換）
- 請求管理（発行・送付・期限/ステータス表示・PDF）
- 入金管理（請求紐付け・消込ステータス）
- ダッシュボード（KPI集計）
- 認証（Credentials, Auth.js v5）

## 技術スタック
- Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS
- Prisma ORM / PostgreSQL (Neon, Pooler)
- Auth.js (NextAuth v5) / bcryptjs
- @react-pdf/renderer（PDF）/ Resend（メール：未設定時はモック）
- デプロイ: Vercel

## デモ・運用メモ
- 本番URLで reseed（デモユーザー復旧）が必要なときは以下（管理トークン必須）
  - `GET /api/admin/reseed?token=<RESEED_TOKEN>`
  - RESEED_TOKEN は Vercel の ENV に設定。公開はしないでください。

## ローカル開発
```bash
git clone <this repo>
cd mini-saas-invoice
npm ci
cp env.production.example .env  # 値を必要に応じて調整
npx prisma generate
npm run dev -p 3000
```
アクセス: http://localhost:3000

## 環境変数（抜粋）
- `DATABASE_URL`（Neonのpooler接続。末尾に `?sslmode=require&pgbouncer=true&connection_limit=1` 推奨）
- `AUTH_SECRET` / `NEXTAUTH_SECRET`（32byte以上）
- `AUTH_TRUST_HOST=true`
- `RESEND_API_KEY`（未設定ならモック送信）

## デプロイ（Vercel）
- Build Command: `npm run build`
- Install Command: `npm ci`
- Types/ESLintエラーは `next.config.js` でビルドをブロックしない設定

## ディレクトリ
```
src/
├─ app/
│  ├─ (app)/ ... 各機能ページ
│  ├─ actions/ ... Server Actions
│  └─ api/ ... Route Handlers(API)
├─ lib/ ... prisma など
└─ schemas/ ... zod スキーマ
```

## ライセンス
ISC

## ポートフォリオ提出用の要約
求職向けの一枚資料は `docs/PORTFOLIO-SET.md` を参照してください。
