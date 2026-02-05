import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../../../lib/auth";
import { prisma } from "../../../../../../../../lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { weekId } = await params;
  const body = await req.json();

  const content = await prisma.weekContent.create({
    data: {
      weekId,
      type: body.type,
      title: body.title,
      body: body.body || null,
      url: body.url || null,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(content, { status: 201 });
}
