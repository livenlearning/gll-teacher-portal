import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // DIRECT_URL uses the non-pooled Neon connection so prisma migrate
    // can acquire advisory locks (not supported over PgBouncer/pooled)
    directUrl: process.env["DIRECT_URL"],
  },
});
