import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Falls du z.B. Neon o.ä. mit SSL brauchst:
  // ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool)
