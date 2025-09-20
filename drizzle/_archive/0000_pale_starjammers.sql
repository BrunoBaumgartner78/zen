CREATE TABLE "gardens" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"title" varchar(120),
	"cover_url" text NOT NULL,
	"data_json" jsonb NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "haikus" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"garden_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"body" varchar(240) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"user_id" varchar(128) NOT NULL,
	"garden_id" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "likes_user_id_garden_id_pk" PRIMARY KEY("user_id","garden_id")
);
