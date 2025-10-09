# ポートフォリオ提出セット（求人応募用）

- 公開URL: https://invoicemanagementsystem-nine.vercel.app
- デモ: `demo@example.com / password`
- リポジトリ: https://github.com/toshi61017891-cmyk/invoice-management-system

## 1. プロダクト要約（3行）
- 見積→請求→入金を一気通貫で管理する最小SaaS。
- Next.js 15 / React 19 / Prisma / Neon / Vercel で構築。
- PDFとメール送信は本番安全運用のため、APIキー未設定時にモック化。

## 2. 画面/機能
- ダッシュボード: 月次KPI、未回収の把握
- 顧客管理: 検索・作成・編集・削除
- 見積管理: 作成→請求へ変換
- 請求管理: ステータス（DRAFT/SENT/OVERDUE/PAID）、PDF生成、送信（モック）
- 入金管理: 請求紐付け、ステータス（RECORDED/RECONCILED/CANCELLED）

## 3. 技術構成
- Frontend: Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS
- Backend: Server Actions / Route Handlers
- DB: Prisma / PostgreSQL(Neon, Pooler, sslmode=require)
- Auth: Auth.js v5 (Credentials), bcryptjs
- Infra: Vercel（GitHub連携・自動デプロイ）

## 4. 工夫/見どころ
- Next.js 15/React 19の仕様変化（`searchParams`のPromise、`useActionState`、`useFormStatus` 等）に追随。
- Prismaの列挙値・日付のnull安全を考慮、型エラーを最小修正で吸収。
- サーバレス向けDB接続（pooler + `pgbouncer=true&connection_limit=1`）で安定化。
- メール送信はAPIキー未設定時にモック化し、公開デモでも安全に利用可能。

## 5. 使い方（レビュアー向け）
1. 上記URLでログイン（デモアカウント）
2. 顧客を作成 → 見積作成 → 請求に変換 → 入金登録
3. ダッシュボードで数値変化を確認

## 6. 補足
- デモDBが汚れた場合は reseed で初期化（管理者のみ）
  - `GET /api/admin/reseed?token=<RESEED_TOKEN>`
- 機能追加案: 顧客メール重複検知、ワークフロー承認、請求テンプレ、CSV入出力

---
採用担当の方へ: 実運用に向けた改善や機能追加のディスカッション歓迎です。
