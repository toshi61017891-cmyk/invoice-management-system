import { z } from "zod";

/**
 * 請求書明細のスキーマ
 */
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "品目名を入力してください"),
  description: z.string().optional(),
  quantity: z.number().positive("数量は0より大きい値を入力してください"),
  unitPrice: z.number().min(0, "単価は0以上の値を入力してください"),
});

/**
 * 請求書作成フォームのスキーマ
 */
export const invoiceSchema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  issuedAt: z.string().min(1, "発行日を入力してください"),
  dueDate: z.string().min(1, "支払期限を入力してください"),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "明細を1件以上入力してください"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
