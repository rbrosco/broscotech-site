-- Schema mínimo para BROSCOTECH
-- Rode este arquivo em um banco PostgreSQL para habilitar cadastro/login e dashboard.

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Em planejamento',
  progress INTEGER NOT NULL DEFAULT 0,
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

-- Seed demo project + columns
INSERT INTO projects (user_id, title, status, progress)
SELECT u.id, 'Demo Project', 'Em planejamento', 0
FROM users u
WHERE u.login = 'admin'
AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.user_id = u.id AND p.title = 'Demo Project');

DO $$
DECLARE
  demo_project_id BIGINT;
BEGIN
  SELECT p.id INTO demo_project_id
  FROM projects p
  JOIN users u ON u.id = p.user_id
  WHERE u.login = 'admin' AND p.title = 'Demo Project'
  LIMIT 1;

  IF demo_project_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM kanban_columns WHERE project_id = demo_project_id) THEN
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'To Do', 0);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'In Progress', 1);
    INSERT INTO kanban_columns (project_id, title, position) VALUES (demo_project_id, 'Done', 2);
  END IF;
END$$;
