import { NextResponse } from "next/server";
import { updateCustomer, deleteCustomer } from "@/app/actions/customers";

// PUT /api/customers/:id  顧客更新
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await req.json();
    const result = await updateCustomer(id, data);
    const status = result.success ? 200 : result.error === "認証が必要です" ? 401 : 400;
    return NextResponse.json(result, { status });
  } catch (e) {
    return NextResponse.json({ success: false, error: "不正なリクエストです" }, { status: 400 });
  }
}

// DELETE /api/customers/:id  顧客削除
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const result = await deleteCustomer(id);
  const status = result.success ? 200 : result.error === "認証が必要です" ? 401 : 400;
  return NextResponse.json(result, { status });
}


