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

// Standard Week 0 content that every cohort gets automatically
const PRE_UNIT_CONTENT = [
  { type: "LESSON" as const, title: "Welcome & What to Expect", body: "An overview of how Global Learning Labs works and what you'll do over the next four weeks.", order: 0 },
  { type: "VIDEO" as const, title: "Facilitator Introduction", url: "https://example.com/videos/facilitator-intro", body: "Meet your facilitator and hear their vision for this cohort.", order: 1 },
  { type: "RESOURCE" as const, title: "Student Handbook", url: "https://example.com/docs/student-handbook.pdf", body: "Everything you need to know before day one.", order: 2 },
  { type: "TASK" as const, title: "Fill Out Your Profile", body: "Add your name, school, and a short bio to the class Padlet so your partners can meet you.", order: 3 },
  { type: "SURVEY" as const, title: "Pre-Unit Interest Survey", url: "https://example.com/surveys/pre-unit", body: "Let us know what you're most curious about.", order: 4 },
];

// Standard post-unit week content that every cohort gets automatically
const POST_UNIT_CONTENT = [
  { type: "LESSON" as const, title: "Looking Back, Looking Forward", body: "Reflect on what you learned about the world — and yourself — through this unit.", order: 0 },
  { type: "TASK" as const, title: "Culture Journal – Final Entry", body: "Write your closing reflection: What was your biggest takeaway from GLL?", order: 1 },
  { type: "SURVEY" as const, title: "Post-Unit Survey", url: "https://example.com/surveys/post-unit", body: "Share your feedback so we can make the next cohort even better.", order: 2 },
  { type: "RESOURCE" as const, title: "Staying Connected Guide", url: "https://example.com/docs/staying-connected.pdf", body: "Ideas for keeping in touch with your GLL partners after the unit ends.", order: 3 },
  { type: "LINK" as const, title: "GLL Alumni Network", url: "https://example.com/alumni", body: "Join the network of past GLL participants.", order: 4 },
];

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

    // Week 0: Pre-Unit (standard, always unlocked)
    const week0 = await prisma.week.create({
      data: { cohortId: cohort.id, weekNumber: 0, title: "Before We Begin", subtitle: "Prepare for your virtual field trip", unlocked: true },
    });
    await prisma.weekContent.createMany({
      data: PRE_UNIT_CONTENT.map((c) => ({ weekId: week0.id, ...c })),
    });

    // Weeks 1–N: copy from unit weeks (week 1 unlocked, rest locked)
    for (const unitWeek of unit.weeks) {
      const cohortWeek = await prisma.week.create({
        data: {
          cohortId: cohort.id,
          weekNumber: unitWeek.weekNumber,
          title: unitWeek.title,
          subtitle: unitWeek.subtitle,
          unlocked: unitWeek.weekNumber === 1,
        },
      });
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

    // Post-Unit week: weekNumber = max unit week number + 1
    const maxUnitWeekNumber = unit.weeks.length > 0 ? Math.max(...unit.weeks.map((w) => w.weekNumber)) : 0;
    const weekPost = await prisma.week.create({
      data: { cohortId: cohort.id, weekNumber: maxUnitWeekNumber + 1, title: "After the Unit", subtitle: "Reflect and carry the learning forward", unlocked: false },
    });
    await prisma.weekContent.createMany({
      data: POST_UNIT_CONTENT.map((c) => ({ weekId: weekPost.id, ...c })),
    });

    return NextResponse.json(cohort, { status: 201 });
  }

  // --- No unit: create cohort with meta only (no weeks auto-created) ---
  const cohort = await prisma.cohort.create({ data: cohortData });
  await createPartnerSchools(cohort.id);

  return NextResponse.json(cohort, { status: 201 });
}
