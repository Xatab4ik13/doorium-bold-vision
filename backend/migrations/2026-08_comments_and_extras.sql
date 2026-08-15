-- Doorium: комментарии к заявкам, расширенные позиции монтажа, связь заявок,
-- поля смет и приведение дат к timestamptz.
-- Выполнять один раз:
--   sudo -u postgres psql doorium_db -f /var/www/api/migrations/2026-08_comments_and_extras.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- === 1. Комментарии к заявкам ===
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT,
  author_role TEXT,
  stage TEXT NOT NULL DEFAULT 'general', -- 'measurement' | 'installation' | 'general'
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE request_comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE request_comments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_request_comments_request ON request_comments(request_id, created_at);

-- Разовый перенос старых заметок из requests.notes в ленту комментариев
INSERT INTO request_comments (request_id, author_name, author_role, stage, text, created_at)
SELECT r.id, 'Импорт', 'system',
       CASE WHEN r.type = 'installation' THEN 'installation'
            WHEN r.type = 'measurement' THEN 'measurement'
            ELSE 'general' END,
       r.notes, COALESCE(r.updated_at, r.created_at)
FROM requests r
WHERE r.notes IS NOT NULL AND btrim(r.notes) <> ''
  AND NOT EXISTS (SELECT 1 FROM request_comments c WHERE c.request_id = r.id);

-- === 2. Расширенные позиции монтажа + связь заявок ===
ALTER TABLE requests ADD COLUMN IF NOT EXISTS entrance_panels INTEGER;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS baseboard_meters NUMERIC(10,2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS portals INTEGER;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS parent_request_id UUID REFERENCES requests(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_requests_parent ON requests(parent_request_id);

-- === 3. Поля смет ===
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- === 4. Приведение дат к timestamptz (существующие значения трактуем как UTC) ===
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'timestamp without time zone'
      AND (
        (table_name = 'requests'  AND column_name IN ('created_at','updated_at','closed_at','accepted_at','external_synced_at'))
        OR (table_name = 'estimates' AND column_name IN ('created_at','updated_at'))
        OR (table_name = 'users' AND column_name = 'created_at')
        OR (table_name = 'articles' AND column_name IN ('created_at','updated_at'))
        OR (table_name = 'push_subscriptions' AND column_name = 'created_at')
        OR (table_name = 'partner_forms' AND column_name = 'created_at')
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
      t.table_name, t.column_name, t.column_name
    );
  END LOOP;
END $$;

-- === 5. Права приложения ===
DO $$
DECLARE app_user TEXT;
BEGIN
  FOR app_user IN SELECT rolname FROM pg_roles WHERE rolcanlogin AND rolname NOT IN ('postgres') LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_comments TO %I', app_user);
  END LOOP;
END $$;
