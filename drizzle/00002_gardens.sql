-- drizzle/0002_gardens.sql
CREATE TABLE IF NOT EXISTS "gardens" (
  "id" varchar(40) PRIMARY KEY,
  "userId" varchar(191) NOT NULL,
  "title" varchar(200) NOT NULL,
  "coverUrl" text NOT NULL,
  "dataJson" jsonb NOT NULL,
  "isPublic" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "gardens_user_idx" ON "gardens" ("userId");
CREATE INDEX IF NOT EXISTS "gardens_public_idx" ON "gardens" ("isPublic","createdAt");
