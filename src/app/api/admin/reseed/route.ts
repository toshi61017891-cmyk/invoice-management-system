import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== process.env.RESEED_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const email = "demo@example.com";
    const passwordHash = await hash("password", 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, name: "デモユーザー" },
      create: { email, name: "デモユーザー", passwordHash },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error("[reseed]", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}


