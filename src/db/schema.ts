// src/db/schema.ts
import { pgTable, varchar, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";

// users (einfach gehalten – ohne hasPremium-Spalte)
export const users = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  image: text("image"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// gardens – du nutzt camelCase-Spaltennamen
export const gardens = pgTable("gardens", {
  id:        varchar("id", { length: 128 }).primaryKey().notNull(),
  userId:    varchar("userId", { length: 191 }).notNull(),
  title:     varchar("title", { length: 200 }).notNull(),
  coverUrl:  text("coverUrl").notNull(),
  dataJson:  jsonb("dataJson").notNull(),
  isPublic:  boolean("isPublic").notNull().default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
