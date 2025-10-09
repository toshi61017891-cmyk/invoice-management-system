/**
 * 顧客データのバリデーションスキーマ
 *
 * Zodを使用してフロントエンドとバックエンドで
 * 共通のバリデーションルールを定義します。
 */

import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名は必須です")
    .max(100, "顧客名は100文字以内で入力してください"),
  // 前後の空白を除去し、空文字は未設定扱いにする
  email: z
    .string()
    .trim()
    .email("正しいメールアドレスを入力してください")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  phone: z
    .string()
    .max(20, "電話番号は20文字以内で入力してください")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  address: z
    .string()
    .max(200, "住所は200文字以内で入力してください")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
