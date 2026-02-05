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

  const { id: cohortId } = await params;
  const body = await req.json();

  const week = await prisma.week.create({
    data: {
      cohortId,
      weekNumber: body.weekNumber,
      title: body.title,
    },
  });

  return NextResponse.json(week, { status: 201 });
}
