-- Doorium Database Schema
-- Run this on your PostgreSQL server after creating the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- === Users ===
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'measurer', 'installer', 'partner')),
  phone TEXT UNIQUE,
  email TEXT,
  pin TEXT,
  password_hash TEXT,
  telegram_id TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Requests ===
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  city TEXT,
  type TEXT DEFAULT 'measurement' CHECK (type IN ('measurement', 'installation', 'reclamation')),
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'site',
  work_description TEXT,
  notes TEXT,
  extra_name TEXT,
  extra_phone TEXT,
  photos JSONB DEFAULT '[]',
  interior_doors INTEGER,
  entrance_doors INTEGER,
  partitions INTEGER,
  measurer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  installer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  installer_2_id UUID REFERENCES users(id) ON DELETE SET NULL,
  installer_3_id UUID REFERENCES users(id) ON DELETE SET NULL,
  installer_4_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agreed_date DATE,
  status_comment TEXT,
  amount NUMERIC,
  accepted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  external_id TEXT,
  external_system TEXT,
  external_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Articles ===
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT DEFAULT '',
  image TEXT DEFAULT '',
  content TEXT DEFAULT '',
  read_time TEXT DEFAULT '5 мин',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Estimates ===
CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  city TEXT,
  items JSONB DEFAULT '[]',
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Partner Forms ===
CREATE TABLE IF NOT EXISTS partner_forms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === Push Subscriptions ===
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- === Bridge Rejected (blacklist) ===
CREATE TABLE IF NOT EXISTS bridge_rejected (
  external_id TEXT NOT NULL,
  external_system TEXT NOT NULL DEFAULT 'primedoor',
  rejected_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (external_id, external_system)
);

-- === Employee Absences ===
CREATE TABLE IF NOT EXISTS employee_absences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('dayoff','vacation','sick')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_absences_user_date ON employee_absences(user_id, date);

-- === Indexes ===
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_city ON requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_measurer ON requests(measurer_id);
CREATE INDEX IF NOT EXISTS idx_requests_installer ON requests(installer_id);
CREATE INDEX IF NOT EXISTS idx_requests_partner ON requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- === Create admin user ===
-- IMPORTANT: Change the password hash below!
-- Generate with: node -e "require('bcrypt').hash('YOUR_PASSWORD', 10).then(h => console.log(h))"
INSERT INTO users (name, role, email, password_hash, active)
VALUES ('Администратор', 'admin', 'admin@doorium.ru', '$2b$10$REPLACE_WITH_YOUR_HASH', true)
ON CONFLICT DO NOTHING;
