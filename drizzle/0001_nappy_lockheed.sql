CREATE TABLE "accounts" (
	"userId" varchar(191) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" timestamp with time zone,
	"token_type" varchar(255),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(120),
	"email" varchar(191) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"image" varchar,
	"has_premium" boolean DEFAULT false NOT NULL,
	"premium_since" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) PRIMARY KEY NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "haikus" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "haikus" CASCADE;--> statement-breakpoint
DROP TABLE "likes" CASCADE;--> statement-breakpoint
ALTER TABLE "gardens" ALTER COLUMN "title" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "gardens" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "userId" varchar(191) NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "coverUrl" text NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "dataJson" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "isPublic" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "gardens" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "cover_url";--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "data_json";--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "is_public";--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "gardens" DROP COLUMN "updated_at";