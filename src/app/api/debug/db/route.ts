import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    const cols = await db.execute(sql`
      select column_name, data_type
      from information_schema.columns
      where table_name = 'users'
      order by column_name
    `)
    return NextResponse.json({
      databaseUrlHost: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "unknown",
      usersColumns: cols.rows,
    })
  } catch (e: any) {
    return new NextResponse(e?.message ?? "db error", { status: 500 })
  }
}
