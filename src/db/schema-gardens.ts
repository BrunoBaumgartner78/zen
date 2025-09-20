// src/db/schema-gardens.ts
import { pgTable, varchar, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core'

export const gardens = pgTable('gardens', {
  id:         varchar('id', { length: 128 }).primaryKey().notNull(),

  // ← echte Spalte heißt userId (camelCase)
  userId:     varchar('userId', { length: 191 }).notNull(),

  title:      varchar('title', { length: 200 }).notNull(),

  // ← echte Spalte heißt coverUrl (camelCase)
  coverUrl:   text('coverUrl').notNull(),

  // ← echte Spalte heißt dataJson (camelCase)
  dataJson:   jsonb('dataJson').notNull(),

  // ← echte Spalte heißt isPublic (camelCase)
  isPublic:   boolean('isPublic').notNull().default(true),

  // ← echte Spalte heißt createdAt (camelCase)
  createdAt:  timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),

  // Soft-Expiry (Hybrid)
  isExpired:  boolean('isExpired').notNull().default(false),
  expiredAt:  timestamp('expiredAt', { withTimezone: true }),
})
