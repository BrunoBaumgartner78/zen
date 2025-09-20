import { pgTable, varchar, text, jsonb, boolean, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gardens = pgTable("gardens", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar({ length: 191 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	coverUrl: text().notNull(),
	dataJson: jsonb().notNull(),
	isPublic: boolean().default(true).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
});

export const accounts = pgTable("accounts", {
	userId: varchar({ length: 191 }).notNull(),
	type: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }).notNull(),
	providerAccountId: varchar({ length: 255 }).notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	tokenType: varchar("token_type", { length: 255 }),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
	sessionToken: varchar({ length: 255 }).primaryKey().notNull(),
	userId: varchar({ length: 191 }).notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
});

export const users = pgTable("users", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	name: varchar({ length: 120 }),
	email: varchar({ length: 191 }).notNull(),
	image: varchar(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	hasPremium: boolean("has_premium").default(false).notNull(),
	premiumSince: timestamp("premium_since", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const verificationTokens = pgTable("verificationTokens", {
	identifier: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).primaryKey().notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
});

export const usersBackup = pgTable("users_backup", {
	id: varchar({ length: 128 }),
	name: varchar({ length: 120 }),
	email: varchar({ length: 191 }),
	image: varchar(),
	passwordHash: varchar("password_hash", { length: 255 }),
	hasPremium: boolean("has_premium"),
	premiumSince: timestamp("premium_since", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
});
