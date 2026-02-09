import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { updates } = await request.json();

    // Updates is an array of { cohortTeacherId, sessionDay, sessionTime }
    await Promise.all(
      updates.map((update: { cohortTeacherId: string; sessionDay: string | null; sessionTime: string | null }) =>
        prisma.cohortTeacher.update({
          where: { id: update.cohortTeacherId },
          data: {
            sessionDay: update.sessionDay,
            sessionTime: update.sessionTime,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update session times:", error);
    return NextResponse.json({ error: "Failed to update session times" }, { status: 500 });
  }
}
