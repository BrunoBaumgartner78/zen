import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const gardens = pgTable('gardens', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  coverUrl: text('coverUrl').notNull(),           // lassen wir NOT NULL
  dataJson: jsonb('dataJson').notNull(),
  isPublic: boolean('isPublic').notNull().default(true),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),

  // → Flags für Aufräumlogik
  isExpired: boolean('isExpired').notNull().default(false),
  expiredAt: timestamp('expiredAt', { withTimezone: true }),
})
