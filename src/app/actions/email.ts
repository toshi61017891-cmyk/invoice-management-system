"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/auth";
import { generateInvoicePDF } from "@/lib/pdf/generatePDF";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 請求書をメール送信する
 */
export async function sendInvoiceEmail(invoiceId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // 請求書データを取得
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      return { success: false, error: "請求書が見つかりません" };
    }

    if (!invoice.customer.email) {
      return { success: false, error: "顧客のメールアドレスが登録されていません" };
    }

    // PDF生成
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      dueDate: invoice.dueDate,
      customer: invoice.customer,
      items: invoice.items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
      })),
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      notes: invoice.notes,
    });

    // メール送信（開発環境ではAPIキーがない場合はスキップ）
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_***redacted***") {
      console.log("⚠️ RESEND_API_KEYが設定されていません。メール送信をスキップします。");

      // メール送信履歴のみ記録（開発用）
      await prisma.mailLog.create({
        data: {
          to: invoice.customer.email,
          subject: `【請求書】${invoice.invoiceNumber}`,
          status: "PENDING",
          sentAt: new Date(),
          invoiceId: invoice.id,
          userId,
        },
      });

      return {
        success: true,
        message: "開発環境: メール送信をスキップしましたが、履歴は記録されました",
      };
    }

    // Resend経由でメール送信
    const mailFrom = process.env.MAIL_FROM || "noreply@example.com";
    const emailResult = await resend.emails.send({
      from: mailFrom,
      to: invoice.customer.email,
      subject: `【請求書】${invoice.invoiceNumber}`,
      html: `
        <h2>請求書のご送付</h2>
        <p>${invoice.customer.name} 様</p>
        <p>いつもお世話になっております。</p>
        <p>請求書を添付ファイルにてお送りいたします。</p>
        
        <ul>
          <li><strong>請求書番号:</strong> ${invoice.invoiceNumber}</li>
          <li><strong>発行日:</strong> ${new Date(invoice.issuedAt).toLocaleDateString("ja-JP")}</li>
          <li><strong>支払期限:</strong> ${new Date(invoice.dueDate).toLocaleDateString("ja-JP")}</li>
          <li><strong>請求金額:</strong> ¥${invoice.total.toLocaleString()}</li>
        </ul>
        
        <p>お支払いのほど、何卒よろしくお願い申し上げます。</p>
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      `,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // メール送信履歴を記録
    await prisma.mailLog.create({
      data: {
        to: invoice.customer.email,
        subject: `【請求書】${invoice.invoiceNumber}`,
        status: "SENT",
        sentAt: new Date(),
        invoiceId: invoice.id,
        userId,
      },
    });

    // 請求書のステータスを「送付済み」に更新
    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "SENT" },
      });
    }

    revalidatePath("/invoices");
    return {
      success: true,
      message: `${invoice.customer.email} にメールを送信しました`,
      emailId: emailResult.id,
    };
  } catch (error) {
    console.error("メール送信エラー:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "メール送信に失敗しました",
    };
  }
}
