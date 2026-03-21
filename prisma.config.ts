import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://app:app@127.0.0.1:55432/app?schema=public",
  },
});
