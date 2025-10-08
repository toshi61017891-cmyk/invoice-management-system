import { z } from "zod";

/**
 * 入金バリデーションスキーマ
 */
export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "請求書を選択してください"),
  amount: z.number().positive("金額は0より大きい値を入力してください"),
  paidAt: z.coerce.date(),
  method: z.enum(["BANK_TRANSFER", "CREDIT_CARD", "CASH", "OTHER"]),
  status: z.enum(["RECORDED", "RECONCILED", "CANCELLED"]),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
