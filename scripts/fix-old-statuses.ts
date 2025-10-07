import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 古いステータスを修正中...");

  // ISSUED -> SENT
  const issuedResult = await prisma.$executeRaw`
    UPDATE invoices SET status = 'SENT' WHERE status = 'ISSUED'
  `;
  console.log(`✅ ISSUED -> SENT: ${issuedResult}件更新`);

  // PARTIAL_PAID -> SENT (一部入金は送付済みとして扱う)
  const partialPaidResult = await prisma.$executeRaw`
    UPDATE invoices SET status = 'SENT' WHERE status = 'PARTIAL_PAID'
  `;
  console.log(`✅ PARTIAL_PAID -> SENT: ${partialPaidResult}件更新`);

  // CANCELLED -> DRAFT (キャンセルは下書きに戻す)
  const cancelledResult = await prisma.$executeRaw`
    UPDATE invoices SET status = 'DRAFT' WHERE status = 'CANCELLED'
  `;
  console.log(`✅ CANCELLED -> DRAFT: ${cancelledResult}件更新`);

  console.log("✨ 完了！");
}

main()
  .catch((e) => {
    console.error("❌ エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
