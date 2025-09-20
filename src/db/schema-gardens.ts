import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const gardens = pgTable('gardens', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  coverUrl: text('coverUrl').notNull(),
  dataJson: jsonb('dataJson').notNull(),      // oder text(...) wenn du STRING speicherst
  isPublic: boolean('isPublic').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  isExpired: boolean('isExpired').notNull().default(false),
  expiredAt: timestamp('expiredAt', { withTimezone: true }),
})
