import { NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/app/actions/customers";

// GET /api/customers?search=...  顧客一覧
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const result = await getCustomers(search || undefined);
  const status = result.success ? 200 : result.error === "認証が必要です" ? 401 : 400;
  return NextResponse.json(result, { status });
}

// POST /api/customers  顧客作成
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await createCustomer(data);
    const status = result.success ? 201 : result.error === "認証が必要です" ? 401 : 400;
    return NextResponse.json(result, { status });
  } catch (e) {
    return NextResponse.json({ success: false, error: "不正なリクエストです" }, { status: 400 });
  }
}


