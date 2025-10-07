/**
 * 見積データのバリデーションスキーマ
 */

import { z } from "zod";

// 見積明細のスキーマ
export const quoteItemSchema = z.object({
  name: z.string().min(1, "品目名は必須です").max(100, "品目名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").optional(),
  quantity: z.coerce.number().positive("数量は1以上を指定してください"),
  unitPrice: z.coerce.number().min(0, "単価は0以上を指定してください"),
});

export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

// 見積のスキーマ
export const quoteSchema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  issuedAt: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  notes: z.string().max(1000, "備考は1000文字以内で入力してください").optional(),
  items: z.array(quoteItemSchema).min(1, "明細を1つ以上追加してください"),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
