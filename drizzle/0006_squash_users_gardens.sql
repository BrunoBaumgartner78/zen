-- 0006_squash_users_gardens.sql (idempotent)

-- USERS: ohne Drops, nur sicherstellen, dass alles da ist
CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar(128) PRIMARY KEY,
  "email" varchar(191) UNIQUE NOT NULL,
  "name" varchar(120),
  "image" text,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamptz DEFAULT now()
);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_premium" boolean NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium_since" timestamptz;

-- GARDENS: aktuelles Schema (idempotent)
CREATE TABLE IF NOT EXISTS "gardens" (
  "id" varchar(40) PRIMARY KEY,
  "userId" varchar(191) NOT NULL,
  "title" varchar(200) NOT NULL,
  "coverUrl" text NOT NULL,
  "dataJson" jsonb NOT NULL,
  "isPublic" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "gardens_user_idx"   ON "gardens" ("userId");
CREATE INDEX IF NOT EXISTS "gardens_public_idx" ON "gardens" ("isPublic","createdAt");
