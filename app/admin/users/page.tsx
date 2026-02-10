import { prisma } from "../../../lib/prisma";
import CreateUserForm from "../../../components/create-user-form";
import UsersTable from "../../../components/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      cohortTeachers: {
        include: {
          cohort: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const cohorts = await prisma.cohort.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Users</h1>

      <CreateUserForm />

      <UsersTable users={users} availableCohorts={cohorts} />
    </div>
  );
}
