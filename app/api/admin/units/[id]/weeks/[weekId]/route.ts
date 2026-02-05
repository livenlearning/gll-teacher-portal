import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { weekId } = await params;
  const body = await req.json();

  const week = await prisma.unitWeek.update({
    where: { id: weekId },
    data: {
      title: body.title ?? undefined,
      subtitle: body.subtitle !== undefined ? body.subtitle : undefined,
    },
  });

  return NextResponse.json(week);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; weekId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { weekId } = await params;

  // Cascade: UnitWeekContent rows deleted automatically
  await prisma.unitWeek.delete({ where: { id: weekId } });

  return NextResponse.json({ ok: true });
}
