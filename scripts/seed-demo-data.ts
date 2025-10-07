import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 デモ用データを作成中...");

  // 既存のユーザーを取得またはデモユーザーを作成
  let demoUser = await prisma.user.findFirst({
    where: { email: "demo@example.com" },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "デモユーザー",
        passwordHash: "demo_password_hash", // デモ用のハッシュ
      },
    });
  }

  console.log("✅ デモユーザー作成完了");

  // デモ顧客を作成
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "demo-customer-1" },
      update: {},
      create: {
        id: "demo-customer-1",
        name: "株式会社サンプル",
        email: "info@sample.co.jp",
        phone: "03-1234-5678",
        address: "東京都渋谷区サンプル1-2-3",
        userId: demoUser.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: "demo-customer-2" },
      update: {},
      create: {
        id: "demo-customer-2",
        name: "テスト商事株式会社",
        email: "contact@test-shoji.co.jp",
        phone: "06-9876-5432",
        address: "大阪府大阪市北区テスト2-3-4",
        userId: demoUser.id,
      },
    }),
    prisma.customer.upsert({
      where: { id: "demo-customer-3" },
      update: {},
      create: {
        id: "demo-customer-3",
        name: "個人事業主 田中太郎",
        email: "tanaka@example.com",
        phone: "090-1234-5678",
        address: "神奈川県横浜市港北区田中3-4-5",
        userId: demoUser.id,
      },
    }),
  ]);

  console.log("✅ デモ顧客作成完了");

  // デモ見積を作成
  const quotes = await Promise.all([
    prisma.quote.upsert({
      where: { id: "demo-quote-1" },
      update: {},
      create: {
        id: "demo-quote-1",
        quoteNumber: "QUO-20241219-001",
        status: "ACCEPTED",
        issuedAt: new Date("2024-12-01"),
        validUntil: new Date("2024-12-31"),
        subtotal: 100000,
        tax: 10000,
        total: 110000,
        notes: "Webサイト制作の見積書です。",
        userId: demoUser.id,
        customerId: customers[0].id,
      },
    }),
    prisma.quote.upsert({
      where: { id: "demo-quote-2" },
      update: {},
      create: {
        id: "demo-quote-2",
        quoteNumber: "QUO-20241219-002",
        status: "SENT",
        issuedAt: new Date("2024-12-05"),
        validUntil: new Date("2025-01-05"),
        subtotal: 200000,
        tax: 20000,
        total: 220000,
        notes: "システム開発の見積書です。",
        userId: demoUser.id,
        customerId: customers[1].id,
      },
    }),
  ]);

  console.log("✅ デモ見積作成完了");

  // デモ見積明細を作成
  await Promise.all([
    prisma.quoteItem.upsert({
      where: { id: "demo-quote-item-1" },
      update: {},
      create: {
        id: "demo-quote-item-1",
        name: "Webサイト制作",
        description: "レスポンシブ対応のコーポレートサイト制作",
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
        quoteId: quotes[0].id,
      },
    }),
    prisma.quoteItem.upsert({
      where: { id: "demo-quote-item-2" },
      update: {},
      create: {
        id: "demo-quote-item-2",
        name: "システム開発",
        description: "ECサイトの開発・構築",
        quantity: 1,
        unitPrice: 200000,
        amount: 200000,
        quoteId: quotes[1].id,
      },
    }),
  ]);

  console.log("✅ デモ見積明細作成完了");

  // デモ請求書を作成
  const invoices = await Promise.all([
    prisma.invoice.upsert({
      where: { id: "demo-invoice-1" },
      update: {},
      create: {
        id: "demo-invoice-1",
        invoiceNumber: "INV-20241219-001",
        status: "PAID",
        issuedAt: new Date("2024-12-01"),
        dueDate: new Date("2024-12-31"),
        subtotal: 100000,
        tax: 10000,
        total: 110000,
        paidAmount: 110000,
        notes: "Webサイト制作の請求書です。",
        userId: demoUser.id,
        customerId: customers[0].id,
        quoteId: quotes[0].id,
      },
    }),
    prisma.invoice.upsert({
      where: { id: "demo-invoice-2" },
      update: {},
      create: {
        id: "demo-invoice-2",
        invoiceNumber: "INV-20241219-002",
        status: "SENT",
        issuedAt: new Date("2024-12-05"),
        dueDate: new Date("2025-01-05"),
        subtotal: 200000,
        tax: 20000,
        total: 220000,
        paidAmount: 0,
        notes: "システム開発の請求書です。",
        userId: demoUser.id,
        customerId: customers[1].id,
        quoteId: quotes[1].id,
      },
    }),
    prisma.invoice.upsert({
      where: { id: "demo-invoice-3" },
      update: {},
      create: {
        id: "demo-invoice-3",
        invoiceNumber: "INV-20241219-003",
        status: "OVERDUE",
        issuedAt: new Date("2024-11-01"),
        dueDate: new Date("2024-12-01"),
        subtotal: 50000,
        tax: 5000,
        total: 55000,
        paidAmount: 0,
        notes: "コンサルティング料金の請求書です。",
        userId: demoUser.id,
        customerId: customers[2].id,
      },
    }),
  ]);

  console.log("✅ デモ請求書作成完了");

  // デモ請求書明細を作成
  await Promise.all([
    prisma.invoiceItem.upsert({
      where: { id: "demo-invoice-item-1" },
      update: {},
      create: {
        id: "demo-invoice-item-1",
        name: "Webサイト制作",
        description: "レスポンシブ対応のコーポレートサイト制作",
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
        invoiceId: invoices[0].id,
      },
    }),
    prisma.invoiceItem.upsert({
      where: { id: "demo-invoice-item-2" },
      update: {},
      create: {
        id: "demo-invoice-item-2",
        name: "システム開発",
        description: "ECサイトの開発・構築",
        quantity: 1,
        unitPrice: 200000,
        amount: 200000,
        invoiceId: invoices[1].id,
      },
    }),
    prisma.invoiceItem.upsert({
      where: { id: "demo-invoice-item-3" },
      update: {},
      create: {
        id: "demo-invoice-item-3",
        name: "コンサルティング",
        description: "業務改善コンサルティング",
        quantity: 10,
        unitPrice: 5000,
        amount: 50000,
        invoiceId: invoices[2].id,
      },
    }),
  ]);

  console.log("✅ デモ請求書明細作成完了");

  // デモ入金を作成
  await prisma.payment.upsert({
    where: { id: "demo-payment-1" },
    update: {},
    create: {
      id: "demo-payment-1",
      amount: 110000,
      paidAt: new Date("2024-12-15"),
      method: "BANK_TRANSFER",
      status: "RECONCILED",
      notes: "銀行振込にて入金確認済み",
      userId: demoUser.id,
      invoiceId: invoices[0].id,
    },
  });

  console.log("✅ デモ入金作成完了");

  console.log("🎉 デモ用データの作成が完了しました！");
  console.log("📧 ログイン情報: demo@example.com / password");
}

main()
  .catch((e) => {
    console.error("❌ エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
