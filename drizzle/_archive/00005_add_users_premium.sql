ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_premium" boolean NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium_since" timestamp;
