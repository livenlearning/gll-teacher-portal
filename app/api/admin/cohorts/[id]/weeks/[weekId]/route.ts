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

  const week = await prisma.week.update({
    where: { id: weekId },
    data: { unlocked: body.unlocked },
  });

  return NextResponse.json(week);
}
