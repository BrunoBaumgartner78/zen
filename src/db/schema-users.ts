import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  hasPremium: boolean('has_premium').notNull().default(false),        // ← snake_case
  premiumSince: timestamp('premium_since', { withTimezone: true }),   // ← snake_case
});
