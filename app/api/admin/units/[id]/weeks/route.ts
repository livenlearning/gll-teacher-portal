import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: unitId } = await params;
  const body = await req.json();

  if (!body.title || body.weekNumber === undefined) {
    return NextResponse.json({ error: "title and weekNumber are required" }, { status: 400 });
  }

  const week = await prisma.unitWeek.create({
    data: {
      unitId,
      weekNumber: body.weekNumber,
      title: body.title,
      subtitle: body.subtitle || null,
    },
  });

  return NextResponse.json({ ...week, content: [] }, { status: 201 });
}
