/**
 * 顧客管理のServer Actions
 *
 * データベース操作をサーバーサイドで実行します。
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/schemas/customer";
import { getCurrentUserId } from "@/auth";

/**
 * 顧客一覧を取得
 */
export async function getCustomers(search?: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    const customers = await prisma.customer.findMany({
      where: {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: customers };
  } catch (error) {
    console.error("顧客一覧取得エラー:", error);
    return { success: false, error: "顧客一覧の取得に失敗しました" };
  }
}

/**
 * 顧客を作成
 */
export async function createCustomer(data: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // バリデーション
    const validated = customerSchema.parse(data);

    const customer = await prisma.customer.create({
      data: {
        ...validated,
        userId,
      },
    });

    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    console.error("顧客作成エラー:", error);
    return { success: false, error: "顧客の作成に失敗しました" };
  }
}

/**
 * 顧客を更新
 */
export async function updateCustomer(id: string, data: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    // バリデーション
    const validated = customerSchema.parse(data);

    const customer = await prisma.customer.update({
      where: { id, userId },
      data: validated,
    });

    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    console.error("顧客更新エラー:", error);
    return { success: false, error: "顧客の更新に失敗しました" };
  }
}

/**
 * 顧客を削除
 */
export async function deleteCustomer(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "認証が必要です" };
    }

    await prisma.customer.delete({
      where: { id, userId },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("顧客削除エラー:", error);
    return { success: false, error: "顧客の削除に失敗しました" };
  }
}
