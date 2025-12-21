-- Schema mínimo para BROSCOTECH
-- Rode este arquivo em um banco PostgreSQL para habilitar cadastro/login e dashboard.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migração idempotente (para bancos já existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em planejamento',
  admin_status TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  project_type TEXT,
  final_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_updates (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'update',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);

-- Migração idempotente (para bancos já existentes)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS final_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_status TEXT;

-- Kanban
CREATE TABLE IF NOT EXISTS kanban_columns (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kanban_cards (
  id BIGSERIAL PRIMARY KEY,
  column_id BIGINT REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  assignee_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed admin user for local dev
INSERT INTO users (name, login, email, password)
SELECT 'Admin', 'admin', 'admin@local', '$2b$10$uCmk.xVaTszSteP9QXH31uo9c.Qg4oUZvNM7mUt75dwPZfeQ3S3mK'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE login = 'admin' OR email = 'admin@local');

-- Seed additional admin user for broscotech
INSERT INTO users (name, login, email, password, role)
SELECT 'Admin Broscotech', 'admin_broscotech', 'admin@broscotech.com.br', '$2b$10$uCmk.xVaTszSteP9QXH31uo9c.Qg4oUZvNM7mUt75dwPZfeQ3S3mK', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@broscotech.com.br');

-- Seed projeto + colunas
INSERT INTO projects (user_id, title, status, progress)
SELECT u.id, 'Seu Projeto', 'Em planejamento', 0
FROM users u
WHERE u.login = 'admin'
AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.user_id = u.id AND p.title = 'Seu Projeto');

DO $$
DECLARE
  demo_project_id BIGINT;
BEGIN
  SELECT p.id INTO demo_project_id
  FROM projects p
  JOIN users u ON u.id = p.user_id
  WHERE u.login = 'admin' AND p.title = 'Seu Projeto'
  LIMIT 1;

  IF demo_project_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kanban_columns WHERE project_id = demo_project_id) THEN
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Inicio (Do Projeto)', 0);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Discussão (Sobre o Projeto)', 1);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Tipo de Projeto', 2);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, '1 Fase (Prévia do Projeto)', 3);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, '2 Fase (Segunda Prévia)', 4);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Finalização', 5);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Faturamento', 6);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Concluido', 7);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Não aceito', 8);
  END IF;
END$$;
