CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar(128) PRIMARY KEY,
  "email" varchar(191) UNIQUE NOT NULL,
  "name" varchar(120),
  "image" text,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT now()
);
