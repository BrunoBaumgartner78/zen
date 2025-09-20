CREATE TABLE IF NOT EXISTS users (
  id varchar(128) PRIMARY KEY,
  name varchar(120),
  email varchar(191) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  image text,
  created_at timestamptz DEFAULT now()
);
