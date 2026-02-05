import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data (order respects FK constraints)
  await prisma.unitWeekContent.deleteMany();
  await prisma.unitWeek.deleteMany();
  await prisma.weekContent.deleteMany();
  await prisma.week.deleteMany();
  await prisma.partnerSchool.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // --- Users ---
  const admin = await prisma.user.create({
    data: { email: "admin@gll.edu", password: hashedPassword, name: "Admin User", role: "ADMIN" },
  });

  const teacherTaipei = await prisma.user.create({
    data: { email: "mei@gll.edu", password: hashedPassword, name: "Mei Lin", schoolName: "Taipei American School", role: "TEACHER" },
  });

  const teacherBrooklyn = await prisma.user.create({
    data: { email: "sarah@gll.edu", password: hashedPassword, name: "Sarah Chen", schoolName: "Brooklyn Global Academy", role: "TEACHER" },
  });

  const teacherColombia = await prisma.user.create({
    data: { email: "ana@gll.edu", password: hashedPassword, name: "Ana Rodríguez", schoolName: "Colegio Internacional", role: "TEACHER" },
  });

  // ---------------------------------------------------------------
  // Unit template: "Cultural Exchange"
  // This is the reusable content template that defines weeks 1–4.
  // When a new cohort is created via the admin UI and this unit is
  // selected, weeks 1–4 content is copied from here into the cohort.
  // ---------------------------------------------------------------
  const unit = await prisma.unit.create({
    data: {
      name: "Cultural Exchange",
      description: "A four-week cross-cultural collaboration unit. Students discover, design, refine, and celebrate shared projects with partner schools around the world.",
    },
  });

  // --- Unit Week 1: Discover ---
  const unitWeek1 = await prisma.unitWeek.create({
    data: { unitId: unit.id, weekNumber: 1, title: "Discover", subtitle: "Explore the world through your partners' eyes" },
  });
  await prisma.unitWeekContent.createMany({
    data: [
      { unitWeekId: unitWeek1.id, type: "LESSON", title: "Mapping Our World", body: "Learn how your partner schools' locations connect through geography, culture, and history.", order: 0 },
      { unitWeekId: unitWeek1.id, type: "VIDEO", title: "A Day in My City", url: "https://example.com/videos/day-in-my-city", body: "Short films by students at each partner school showing daily life.", order: 1 },
      { unitWeekId: unitWeek1.id, type: "CROSS_CLASSROOM", title: "Partner Introductions", body: "Join your cross-classroom group and share one thing you're proud of about your community.", order: 2 },
      { unitWeekId: unitWeek1.id, type: "TASK", title: "Culture Journal – Entry 1", body: "Write 3–5 sentences about something new you learned about a partner school.", order: 3 },
      { unitWeekId: unitWeek1.id, type: "RESOURCE", title: "Cultural Facts Sheet", url: "https://example.com/docs/cultural-facts.pdf", body: "Quick reference on customs and traditions at each partner school.", order: 4 },
    ],
  });

  // --- Unit Week 2: Design ---
  const unitWeek2 = await prisma.unitWeek.create({
    data: { unitId: unit.id, weekNumber: 2, title: "Design", subtitle: "Collaborate to create something meaningful" },
  });
  await prisma.unitWeekContent.createMany({
    data: [
      { unitWeekId: unitWeek2.id, type: "LESSON", title: "Design Thinking Basics", body: "An introduction to the design thinking process and how it applies to cross-cultural projects.", order: 0 },
      { unitWeekId: unitWeek2.id, type: "VIDEO", title: "Design Thinking Walkthrough", url: "https://example.com/videos/design-thinking", body: "A visual guide to empathize → define → ideate → prototype → test.", order: 1 },
      { unitWeekId: unitWeek2.id, type: "CROSS_CLASSROOM", title: "Brainstorm Session", body: "Work with your cross-classroom group to brainstorm ideas for your shared project.", order: 2 },
      { unitWeekId: unitWeek2.id, type: "TASK", title: "Project Proposal", body: "Submit a one-page proposal outlining your group's project idea, goals, and roles.", order: 3 },
      { unitWeekId: unitWeek2.id, type: "DELIVERABLE", title: "Mood Board", body: "Create a mood board on Padlet that captures the theme and feel of your project.", order: 4 },
    ],
  });

  // --- Unit Week 3: Refine & Respond ---
  const unitWeek3 = await prisma.unitWeek.create({
    data: { unitId: unit.id, weekNumber: 3, title: "Refine & Respond", subtitle: "Give and receive feedback across cultures" },
  });
  await prisma.unitWeekContent.createMany({
    data: [
      { unitWeekId: unitWeek3.id, type: "LESSON", title: "Giving Feedback Across Cultures", body: "Strategies for constructive, culturally sensitive feedback.", order: 0 },
      { unitWeekId: unitWeek3.id, type: "VIDEO", title: "Feedback in Action", url: "https://example.com/videos/feedback-in-action", body: "See how students from past cohorts gave and received feedback.", order: 1 },
      { unitWeekId: unitWeek3.id, type: "CROSS_CLASSROOM", title: "Peer Review Round", body: "Exchange drafts with another group and provide written feedback using the provided rubric.", order: 2 },
      { unitWeekId: unitWeek3.id, type: "TASK", title: "Culture Journal – Entry 2", body: "Reflect on the feedback you received. How did it shape your project?", order: 3 },
      { unitWeekId: unitWeek3.id, type: "RESOURCE", title: "Feedback Rubric", url: "https://example.com/docs/feedback-rubric.pdf", body: "Use this rubric to structure your peer feedback.", order: 4 },
      { unitWeekId: unitWeek3.id, type: "SURVEY", title: "Mid-Unit Check-In", url: "https://example.com/surveys/mid-unit", body: "How's the experience going? Share your thoughts.", order: 5 },
    ],
  });

  // --- Unit Week 4: Celebrate & Connect ---
  const unitWeek4 = await prisma.unitWeek.create({
    data: { unitId: unit.id, weekNumber: 4, title: "Celebrate & Connect", subtitle: "Share your work and celebrate the journey" },
  });
  await prisma.unitWeekContent.createMany({
    data: [
      { unitWeekId: unitWeek4.id, type: "LESSON", title: "Sharing Is Learning", body: "Why presenting your work matters — and how to do it well across time zones.", order: 0 },
      { unitWeekId: unitWeek4.id, type: "VIDEO", title: "Presentation Tips", url: "https://example.com/videos/presentation-tips", body: "Quick tips for a compelling virtual presentation.", order: 1 },
      { unitWeekId: unitWeek4.id, type: "CROSS_CLASSROOM", title: "Gallery Walk", body: "Browse and respond to each group's final project on Padlet.", order: 2 },
      { unitWeekId: unitWeek4.id, type: "DELIVERABLE", title: "Final Project Submission", body: "Submit your completed project, including all team contributions and a short write-up.", order: 3 },
      { unitWeekId: unitWeek4.id, type: "GALLERY", title: "Celebration Wall", url: "https://padlet.com/gll/celebration", body: "Post a photo, quote, or moment that captures your GLL experience.", order: 4 },
    ],
  });

  // ---------------------------------------------------------------
  // Cohort: Spring 2026 Cohort A  (references the unit above)
  // Weeks 0–5 are seeded directly on the cohort (the same content
  // that the copy-on-creation logic would produce).
  // ---------------------------------------------------------------
  const cohort = await prisma.cohort.create({
    data: {
      name: "Spring 2026 Cohort A",
      slug: "spring-2026-cohort-a",
      teacherId: teacherTaipei.id,
      unitId: unit.id,
      facilitator: "Dr. Lisa Park",
      facilitatorEmail: "lisa.park@gll.edu",
      startDate: new Date("2026-03-09"),
      endDate: new Date("2026-04-17"),
      sessionDay: "Wednesday",
      sessionTime: "3:00 PM – 4:00 PM (ET)",
      zoomLink: "https://zoom.us/j/gll-spring-2026-cohort-a",
      padletLink: "https://padlet.com/gll/spring2026cohortA",
    },
  });

  // --- Partner Schools ---
  await prisma.partnerSchool.createMany({
    data: [
      { cohortId: cohort.id, name: "Taipei American School", location: "Taipei, Taiwan", teacherId: teacherTaipei.id },
      { cohortId: cohort.id, name: "Brooklyn Global Academy", location: "Brooklyn, New York, USA", teacherId: teacherBrooklyn.id },
      { cohortId: cohort.id, name: "Colegio Internacional", location: "Medellín, Colombia", teacherId: teacherColombia.id },
    ],
  });

  // --- Weeks (cohort-level, mirrors unit weeks 1-4 + pre/post) ---
  const week0 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 0, title: "Before We Begin", subtitle: "Prepare for your virtual field trip", unlocked: true },
  });
  const week1 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 1, title: "Discover", subtitle: "Explore the world through your partners' eyes", unlocked: true },
  });
  const week2 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 2, title: "Design", subtitle: "Collaborate to create something meaningful", unlocked: false },
  });
  const week3 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 3, title: "Refine & Respond", subtitle: "Give and receive feedback across cultures", unlocked: false },
  });
  const week4 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 4, title: "Celebrate & Connect", subtitle: "Share your work and celebrate the journey", unlocked: false },
  });
  const week5 = await prisma.week.create({
    data: { cohortId: cohort.id, weekNumber: 5, title: "After the Unit", subtitle: "Reflect and carry the learning forward", unlocked: false },
  });

  // --- Week 0: Before We Begin (standard pre-unit content) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week0.id, type: "LESSON", title: "Welcome & What to Expect", body: "An overview of how Global Learning Labs works and what you'll do over the next four weeks.", order: 0 },
      { weekId: week0.id, type: "VIDEO", title: "Facilitator Introduction", url: "https://example.com/videos/facilitator-intro", body: "Meet Dr. Lisa Park and hear her vision for this cohort.", order: 1 },
      { weekId: week0.id, type: "RESOURCE", title: "Student Handbook", url: "https://example.com/docs/student-handbook.pdf", body: "Everything you need to know before day one.", order: 2 },
      { weekId: week0.id, type: "TASK", title: "Fill Out Your Profile", body: "Add your name, school, and a short bio to the class Padlet so your partners can meet you.", order: 3 },
      { weekId: week0.id, type: "SURVEY", title: "Pre-Unit Interest Survey", url: "https://example.com/surveys/pre-unit", body: "Let us know what you're most curious about.", order: 4 },
    ],
  });

  // --- Week 1: Discover (copied from unit week 1) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week1.id, type: "LESSON", title: "Mapping Our World", body: "Learn how your partner schools' locations connect through geography, culture, and history.", order: 0 },
      { weekId: week1.id, type: "VIDEO", title: "A Day in My City", url: "https://example.com/videos/day-in-my-city", body: "Short films by students at each partner school showing daily life.", order: 1 },
      { weekId: week1.id, type: "CROSS_CLASSROOM", title: "Partner Introductions", body: "Join your cross-classroom group and share one thing you're proud of about your community.", order: 2 },
      { weekId: week1.id, type: "TASK", title: "Culture Journal – Entry 1", body: "Write 3–5 sentences about something new you learned about a partner school.", order: 3 },
      { weekId: week1.id, type: "RESOURCE", title: "Cultural Facts Sheet", url: "https://example.com/docs/cultural-facts.pdf", body: "Quick reference on customs and traditions at each partner school.", order: 4 },
    ],
  });

  // --- Week 2: Design (copied from unit week 2) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week2.id, type: "LESSON", title: "Design Thinking Basics", body: "An introduction to the design thinking process and how it applies to cross-cultural projects.", order: 0 },
      { weekId: week2.id, type: "VIDEO", title: "Design Thinking Walkthrough", url: "https://example.com/videos/design-thinking", body: "A visual guide to empathize → define → ideate → prototype → test.", order: 1 },
      { weekId: week2.id, type: "CROSS_CLASSROOM", title: "Brainstorm Session", body: "Work with your cross-classroom group to brainstorm ideas for your shared project.", order: 2 },
      { weekId: week2.id, type: "TASK", title: "Project Proposal", body: "Submit a one-page proposal outlining your group's project idea, goals, and roles.", order: 3 },
      { weekId: week2.id, type: "DELIVERABLE", title: "Mood Board", body: "Create a mood board on Padlet that captures the theme and feel of your project.", order: 4 },
    ],
  });

  // --- Week 3: Refine & Respond (copied from unit week 3) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week3.id, type: "LESSON", title: "Giving Feedback Across Cultures", body: "Strategies for constructive, culturally sensitive feedback.", order: 0 },
      { weekId: week3.id, type: "VIDEO", title: "Feedback in Action", url: "https://example.com/videos/feedback-in-action", body: "See how students from past cohorts gave and received feedback.", order: 1 },
      { weekId: week3.id, type: "CROSS_CLASSROOM", title: "Peer Review Round", body: "Exchange drafts with another group and provide written feedback using the provided rubric.", order: 2 },
      { weekId: week3.id, type: "TASK", title: "Culture Journal – Entry 2", body: "Reflect on the feedback you received. How did it shape your project?", order: 3 },
      { weekId: week3.id, type: "RESOURCE", title: "Feedback Rubric", url: "https://example.com/docs/feedback-rubric.pdf", body: "Use this rubric to structure your peer feedback.", order: 4 },
      { weekId: week3.id, type: "SURVEY", title: "Mid-Unit Check-In", url: "https://example.com/surveys/mid-unit", body: "How's the experience going? Share your thoughts.", order: 5 },
    ],
  });

  // --- Week 4: Celebrate & Connect (copied from unit week 4) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week4.id, type: "LESSON", title: "Sharing Is Learning", body: "Why presenting your work matters — and how to do it well across time zones.", order: 0 },
      { weekId: week4.id, type: "VIDEO", title: "Presentation Tips", url: "https://example.com/videos/presentation-tips", body: "Quick tips for a compelling virtual presentation.", order: 1 },
      { weekId: week4.id, type: "CROSS_CLASSROOM", title: "Gallery Walk", body: "Browse and respond to each group's final project on Padlet.", order: 2 },
      { weekId: week4.id, type: "DELIVERABLE", title: "Final Project Submission", body: "Submit your completed project, including all team contributions and a short write-up.", order: 3 },
      { weekId: week4.id, type: "GALLERY", title: "Celebration Wall", url: "https://padlet.com/gll/celebration", body: "Post a photo, quote, or moment that captures your GLL experience.", order: 4 },
    ],
  });

  // --- Week 5: After the Unit (standard post-unit content) ---
  await prisma.weekContent.createMany({
    data: [
      { weekId: week5.id, type: "LESSON", title: "Looking Back, Looking Forward", body: "Reflect on what you learned about the world — and yourself — through this unit.", order: 0 },
      { weekId: week5.id, type: "TASK", title: "Culture Journal – Final Entry", body: "Write your closing reflection: What was your biggest takeaway from GLL?", order: 1 },
      { weekId: week5.id, type: "SURVEY", title: "Post-Unit Survey", url: "https://example.com/surveys/post-unit", body: "Share your feedback so we can make the next cohort even better.", order: 2 },
      { weekId: week5.id, type: "RESOURCE", title: "Staying Connected Guide", url: "https://example.com/docs/staying-connected.pdf", body: "Ideas for keeping in touch with your GLL partners after the unit ends.", order: 3 },
      { weekId: week5.id, type: "LINK", title: "GLL Alumni Network", url: "https://example.com/alumni", body: "Join the network of past GLL participants.", order: 4 },
    ],
  });

  console.log("Seed complete.");
  console.log("  Users:");
  console.log("    admin@gll.edu       — ADMIN  (password: password123)");
  console.log("    mei@gll.edu         — TEACHER @ Taipei American School");
  console.log("    sarah@gll.edu       — TEACHER @ Brooklyn Global Academy");
  console.log("    ana@gll.edu         — TEACHER @ Colegio Internacional");
  console.log("  Unit: Cultural Exchange (weeks 1–4 template)");
  console.log("  Cohort: Spring 2026 Cohort A → Cultural Exchange");
  console.log("    Facilitator: Dr. Lisa Park");
  console.log("    Weeks 0 & 1 unlocked; Weeks 2–5 locked");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
