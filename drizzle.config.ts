import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: [
    "./src/db/schema-gardens.ts",
    "./src/db/schema-feed.ts",
    "./src/db/schema-users.ts",   // <- einziges Users-Schema
    // "./src/db/schema-auth.ts", // <- nur einbinden, wenn OHNE users-Table darin!
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
})
