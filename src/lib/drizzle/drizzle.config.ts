import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./src/lib/drizzle/migrations",
  schema: "./src/lib/drizzle/auth-schema.ts",
  dbCredentials: {
    url: "./database.sqlite",
  },
});
