import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const cohort = await prisma.cohort.findUnique({
    where: { id },
    include: {
      teachers: {
        include: {
          teacher: { select: { id: true, name: true, email: true } },
        },
      },
      partnerSchools: true,
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: { content: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!cohort) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cohort);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Handle teacher assignments separately if provided
  if (body.teacherIds !== undefined) {
    // Delete existing teacher assignments
    await prisma.cohortTeacher.deleteMany({
      where: { cohortId: id },
    });

    // Create new teacher assignments
    if (Array.isArray(body.teacherIds) && body.teacherIds.length > 0) {
      await prisma.cohortTeacher.createMany({
        data: body.teacherIds.map((teacherId: string) => ({
          cohortId: id,
          teacherId,
        })),
      });
    }
  }

  const cohort = await prisma.cohort.update({
    where: { id },
    data: {
      name: body.name,
      facilitator: body.facilitator ?? undefined,
      facilitatorEmail: body.facilitatorEmail ?? undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      sessionDay: body.sessionDay ?? undefined,
      sessionTime: body.sessionTime ?? undefined,
      zoomLink: body.zoomLink ?? undefined,
      padletLink: body.padletLink ?? undefined,
    },
  });

  return NextResponse.json(cohort);
}
