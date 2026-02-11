import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(name: string) {
  let slug = generateSlug(name);
  let counter = 2;
  while (await prisma.cohort.findUnique({ where: { slug } })) {
    slug = `${generateSlug(name)}-${counter}`;
    counter++;
  }
  return slug;
}

interface PartnerSchoolInput {
  name: string;
  location?: string;
  teacherId: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const {
    name, unitId,
    facilitator, facilitatorEmail,
    startDate, endDate,
    sessionDay, sessionTime,
    zoomLink, padletLink, mediaFolderLink,
    partnerSchools,
  } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = await uniqueSlug(name);

  // Base cohort data (shared whether or not a unit is selected)
  const cohortData = {
    name,
    slug,
    facilitator: facilitator || null,
    facilitatorEmail: facilitatorEmail || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    sessionDay: sessionDay || null,
    sessionTime: sessionTime || null,
    zoomLink: zoomLink || null,
    mediaFolderLink: mediaFolderLink || null,
    padletLink: padletLink || null,
  };

  // Helper: create partner schools for a cohort
  async function createPartnerSchools(cohortId: string) {
    if (Array.isArray(partnerSchools) && partnerSchools.length > 0) {
      await prisma.partnerSchool.createMany({
        data: partnerSchools.map((ps: PartnerSchoolInput) => ({
          cohortId,
          name: ps.name,
          location: ps.location || null,
          teacherId: ps.teacherId,
        })),
      });
    }
  }

  // --- If a unit is selected, verify it and copy content ---
  if (unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        weeks: {
          orderBy: { weekNumber: "asc" },
          include: { content: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const cohort = await prisma.cohort.create({
      data: { ...cohortData, unitId },
    });

    await createPartnerSchools(cohort.id);

    // Copy all weeks from the unit (no hardcoded content)
    // First week (usually "Before We Begin") is unlocked, rest are locked
    for (const unitWeek of unit.weeks) {
      const cohortWeek = await prisma.week.create({
        data: {
          cohortId: cohort.id,
          weekNumber: unitWeek.weekNumber,
          title: unitWeek.title,
          subtitle: unitWeek.subtitle,
          unlocked: unitWeek.weekNumber === 1, // First module unlocked
        },
      });
      // Copy content if it exists
      if (unitWeek.content.length > 0) {
        await prisma.weekContent.createMany({
          data: unitWeek.content.map((c) => ({
            weekId: cohortWeek.id,
            type: c.type,
            title: c.title,
            body: c.body,
            url: c.url,
            order: c.order,
          })),
        });
      }
    }

    return NextResponse.json(cohort, { status: 201 });
  }

  // --- No unit: create cohort with meta only (no weeks auto-created) ---
  const cohort = await prisma.cohort.create({ data: cohortData });
  await createPartnerSchools(cohort.id);

  return NextResponse.json(cohort, { status: 201 });
}
