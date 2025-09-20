// src/db/schema-community.ts
import { pgTable, varchar, text, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const gardens = pgTable("gardens", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  title: varchar("title", { length: 120 }),
  coverUrl: text("cover_url").notNull(),
  dataJson: jsonb("data_json").notNull(),   // deine Szene (theme, brush, items, paths)
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const likes = pgTable("likes", {
  userId: varchar("user_id", { length: 128 }).notNull(),
  gardenId: varchar("garden_id", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, t => ({ pk: primaryKey({ columns: [t.userId, t.gardenId] }) }))

export const haikus = pgTable("haikus", {
  id: varchar("id", { length: 128 }).primaryKey(),
  gardenId: varchar("garden_id", { length: 128 }).notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  body: varchar("body", { length: 240 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
