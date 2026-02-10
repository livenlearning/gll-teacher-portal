import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { cohortId, teacherId } = await request.json();

    if (!cohortId || !teacherId) {
      return NextResponse.json({ error: "cohortId and teacherId are required" }, { status: 400 });
    }

    // Check if already assigned
    const existing = await prisma.cohortTeacher.findUnique({
      where: {
        cohortId_teacherId: {
          cohortId,
          teacherId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Teacher already assigned to this cohort" }, { status: 400 });
    }

    const cohortTeacher = await prisma.cohortTeacher.create({
      data: {
        cohortId,
        teacherId,
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(cohortTeacher, { status: 201 });
  } catch (error) {
    console.error("Failed to add teacher to cohort:", error);
    return NextResponse.json({ error: "Failed to add teacher to cohort" }, { status: 500 });
  }
}
