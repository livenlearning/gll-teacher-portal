import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../../../../lib/auth";
import { prisma } from "../../../../../../../../../lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; weekId: string; contentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { contentId } = await params;

  await prisma.weekContent.delete({ where: { id: contentId } });

  return NextResponse.json({ ok: true });
}
