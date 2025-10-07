/**
 * Seedデータ投入スクリプト
 *
 * 開発用のダミーデータを作成します。
 * 実行: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seedデータの投入を開始します...");

  // 既存データをクリア（開発環境のみ）
  await prisma.mailLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ========================================
  // 1. ユーザー作成
  // ========================================
  const hashed = await hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "デモユーザー",
      passwordHash: hashed,
    },
  });
  console.log("✅ ユーザー作成:", user.email);

  // ========================================
  // 2. 顧客作成
  // ========================================
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "株式会社サンプル商事",
        email: "contact@sample-corp.jp",
        phone: "03-1234-5678",
        address: "東京都渋谷区道玄坂1-2-3",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "株式会社テスト工業",
        email: "info@test-industry.co.jp",
        phone: "06-9876-5432",
        address: "大阪府大阪市北区梅田4-5-6",
        userId: user.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "個人事業主 山田太郎",
        email: "yamada@example.com",
        phone: "090-1234-5678",
        address: "神奈川県横浜市中区本町7-8-9",
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ 顧客作成: ${customers.length}件`);

  // ========================================
  // 3. 見積作成
  // ========================================
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 30);

  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: "QT-2025-0001",
      status: "SENT",
      issuedAt: today,
      validUntil: validUntil,
      subtotal: 500000,
      tax: 50000,
      total: 550000,
      notes: "Webサイト制作一式",
      customerId: customers[0].id,
      userId: user.id,
      items: {
        create: [
          {
            name: "Webサイト設計",
            description: "要件定義・ワイヤーフレーム作成",
            quantity: 1,
            unitPrice: 150000,
            amount: 150000,
          },
          {
            name: "デザイン制作",
            description: "トップページ＋下層5ページ",
            quantity: 6,
            unitPrice: 50000,
            amount: 300000,
          },
          {
            name: "コーディング",
            description: "レスポンシブ対応",
            quantity: 1,
            unitPrice: 50000,
            amount: 50000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log("✅ 見積作成:", quote1.quoteNumber);

  const quote2 = await prisma.quote.create({
    data: {
      quoteNumber: "QT-2025-0002",
      status: "ACCEPTED",
      issuedAt: today,
      validUntil: validUntil,
      subtotal: 300000,
      tax: 30000,
      total: 330000,
      notes: "システム保守契約（6ヶ月）",
      customerId: customers[1].id,
      userId: user.id,
      items: {
        create: [
          {
            name: "月次保守",
            description: "サーバー監視・バグ修正",
            quantity: 6,
            unitPrice: 50000,
            amount: 300000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log("✅ 見積作成:", quote2.quoteNumber);

  // ========================================
  // 4. 請求作成（見積から）
  // ========================================
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 30);

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2025-0001",
      status: "SENT",
      issuedAt: today,
      dueDate: dueDate,
      subtotal: 500000,
      tax: 50000,
      total: 550000,
      paidAmount: 0,
      customerId: customers[0].id,
      userId: user.id,
      quoteId: quote1.id,
      items: {
        create: [
          {
            name: "Webサイト設計",
            description: "要件定義・ワイヤーフレーム作成",
            quantity: 1,
            unitPrice: 150000,
            amount: 150000,
          },
          {
            name: "デザイン制作",
            description: "トップページ＋下層5ページ",
            quantity: 6,
            unitPrice: 50000,
            amount: 300000,
          },
          {
            name: "コーディング",
            description: "レスポンシブ対応",
            quantity: 1,
            unitPrice: 50000,
            amount: 50000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log("✅ 請求作成:", invoice1.invoiceNumber);

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2025-0002",
      status: "SENT",
      issuedAt: today,
      dueDate: dueDate,
      subtotal: 300000,
      tax: 30000,
      total: 330000,
      paidAmount: 165000,
      customerId: customers[1].id,
      userId: user.id,
      quoteId: quote2.id,
      items: {
        create: [
          {
            name: "月次保守",
            description: "サーバー監視・バグ修正",
            quantity: 6,
            unitPrice: 50000,
            amount: 300000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log("✅ 請求作成:", invoice2.invoiceNumber);

  // 期限超過の請求（テスト用）
  const overdueDueDate = new Date();
  overdueDueDate.setDate(today.getDate() - 10); // 10日前

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2025-0003",
      status: "OVERDUE",
      issuedAt: new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000), // 40日前
      dueDate: overdueDueDate,
      subtotal: 100000,
      tax: 10000,
      total: 110000,
      paidAmount: 0,
      customerId: customers[2].id,
      userId: user.id,
      items: {
        create: [
          {
            name: "コンサルティング",
            description: "事業計画策定支援",
            quantity: 10,
            unitPrice: 10000,
            amount: 100000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log("✅ 請求作成（期限超過）:", invoice3.invoiceNumber);

  // ========================================
  // 5. 入金作成
  // ========================================
  const payment1 = await prisma.payment.create({
    data: {
      amount: 165000,
      paidAt: new Date(),
      method: "BANK_TRANSFER",
      status: "RECONCILED",
      notes: "初回入金",
      invoiceId: invoice2.id,
      userId: user.id,
    },
  });
  console.log("✅ 入金作成:", payment1.amount);

  // ========================================
  // 6. メール送信履歴
  // ========================================
  const mailLog = await prisma.mailLog.create({
    data: {
      to: customers[0].email!,
      subject: "【重要】請求書を送付いたします",
      status: "SENT",
      sentAt: new Date(),
      invoiceId: invoice1.id,
      userId: user.id,
    },
  });
  console.log("✅ メール履歴作成:", mailLog.to);

  console.log("\n🎉 Seedデータの投入が完了しました！");
  console.log("\n📊 作成されたデータ:");
  console.log(`  - ユーザー: 1件`);
  console.log(`  - 顧客: ${customers.length}件`);
  console.log(`  - 見積: 2件`);
  console.log(`  - 請求: 3件`);
  console.log(`  - 入金: 1件`);
  console.log(`  - メール履歴: 1件`);
  console.log("\n💡 Prisma Studioで確認: npx prisma studio");
}

main()
  .catch((e) => {
    console.error("❌ Seedエラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
