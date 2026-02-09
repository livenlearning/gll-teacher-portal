import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const units = await prisma.unit.findMany({
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: { content: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(units);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const unit = await prisma.unit.create({
    data: { name, description: description || null },
  });

  // Auto-create 6 modules with blank titles for user to fill in
  await prisma.unitWeek.createMany({
    data: [1, 2, 3, 4, 5, 6].map((n) => ({
      unitId: unit.id,
      weekNumber: n,
      title: "",
      subtitle: null,
    })),
  });

  const unitWithWeeks = await prisma.unit.findUnique({
    where: { id: unit.id },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: { content: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json(unitWithWeeks, { status: 201 });
}
