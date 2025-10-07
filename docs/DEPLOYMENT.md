# 本番環境デプロイガイド

このドキュメントでは、請求書SaaSアプリケーションをVercelとNeonにデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（https://vercel.com）
- Neonアカウント（https://neon.tech）
- Resendアカウント（https://resend.com）

---

## 🗄️ Step 1: データベース準備（Neon）

### 1-1. Neonプロジェクト作成

1. https://neon.tech にアクセスしてログイン
2. 「Create Project」をクリック
3. プロジェクト名を入力（例: `mini-saas-invoice`）
4. リージョンを選択（Asia Pacific推奨）
5. PostgreSQLバージョンを選択（最新版推奨）
6. 「Create Project」をクリック

### 1-2. 接続文字列の取得

1. Neonダッシュボードで「Connection string」をコピー
2. 形式: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

---

## 📧 Step 2: メールサービス準備（Resend）

### 2-1. Resend APIキー取得

1. https://resend.com にアクセスしてログイン
2. 「API Keys」→「Create API Key」
3. 名前を入力して「Create」
4. 表示されたAPIキーをコピー（一度しか表示されません）

### 2-2. ドメイン認証（オプション）

1. 「Domains」→「Add Domain」
2. 自分のドメインを入力
3. DNS設定を追加（SPF, DKIM, DMARCレコード）
4. 認証完了を確認

---

## 🚀 Step 3: Vercelデプロイ

### 3-1. GitHubリポジトリ作成

1. GitHubで新しいリポジトリを作成
2. ローカルプロジェクトをpush:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3-2. Vercelプロジェクト作成

1. https://vercel.com にアクセスしてログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Import」をクリック

### 3-3. 環境変数の設定

Vercelの「Environment Variables」セクションで以下を設定:

#### 必須変数

```bash
# データベース（Neon）
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# 認証
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="<openssl rand -base64 32で生成>"

# メール送信（Resend）
RESEND_API_KEY="re_***your-api-key***"
MAIL_FROM="noreply@yourdomain.com"

# アプリケーション設定
APP_DEFAULT_TAX_RATE="0.10"
CURRENCY="JPY"
```

#### GitHub OAuth（オプション）

```bash
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"
```

### 3-4. デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイ完了を待つ

---

## 🔧 Step 4: データベースマイグレーション

### 4-1. 本番DBにスキーマを適用

デプロイ後、VercelのFunction LogsまたはCLIで以下を実行:

```bash
npx prisma migrate deploy
```

### 4-2. 初期データの投入（オプション）

```bash
npx prisma db seed
```

---

## ✅ Step 5: デプロイ後の確認

### 5-1. 動作確認

- [ ] トップページにアクセス
- [ ] ログイン機能の確認
- [ ] 顧客登録の確認
- [ ] 見積作成の確認
- [ ] 請求書生成の確認
- [ ] メール送信の確認
- [ ] 入金登録の確認
- [ ] ダッシュボード表示の確認

### 5-2. ログ確認

1. Vercelダッシュボード →「Functions」→「Logs」
2. エラーがないか確認

---

## 🔐 セキュリティチェックリスト

- [ ] `NEXTAUTH_SECRET`は強固なランダム文字列を使用
- [ ] `.env`ファイルは`.gitignore`に含まれている
- [ ] APIキーは環境変数で管理
- [ ] 本番環境では`NEXTAUTH_URL`を正しいドメインに設定
- [ ] データベース接続文字列は暗号化接続（`sslmode=require`）

---

## 🆘 トラブルシューティング

### ビルドエラー

```bash
# 型エラー
npm run build  # ローカルでビルド確認

# 環境変数エラー
# Vercelの環境変数が正しく設定されているか確認
```

### データベース接続エラー

```bash
# 接続文字列の確認
# Neonの「Connection string」をコピーし直す
# `?sslmode=require` が含まれているか確認
```

### メール送信エラー

```bash
# Resend APIキーの確認
# ドメイン認証が完了しているか確認
# MAIL_FROMが認証済みドメインか確認
```

---

## 📊 パフォーマンス最適化

### データベース最適化

```sql
-- インデックスの追加（必要に応じて）
CREATE INDEX idx_invoices_user_status ON invoices(userId, status);
CREATE INDEX idx_payments_invoice ON payments(invoiceId);
```

### Vercel設定

- Edgeミドルウェアの活用
- 静的生成ページの最適化
- 画像最適化の設定

---

## 🔄 継続的デプロイ

GitHubのmainブランチにpushすると自動的にデプロイされます:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercelが自動的に:

1. ビルド実行
2. テスト実行（設定時）
3. 本番環境へデプロイ

---

## 📝 カスタムドメイン設定（オプション）

1. Vercelダッシュボード →「Settings」→「Domains」
2. カスタムドメインを入力
3. DNS設定を追加:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. SSL証明書の自動発行を待つ
