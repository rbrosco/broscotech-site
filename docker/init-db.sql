-- init-db.sql: cria esquema básico para cadastro e kanban

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  login TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kanban_columns (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kanban_cards (
  id SERIAL PRIMARY KEY,
  column_id INTEGER REFERENCES kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  assignee_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin user with login 'admin' and password 'admin' (bcrypt hashed)
INSERT INTO users (email, name, login, password, role)
VALUES ('admin@local', 'Admin', 'admin', '$2b$10$uCmk.xVaTszSteP9QXH31uo9c.Qg4oUZvNM7mUt75dwPZfeQ3S3mK', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed a sample project and columns
INSERT INTO projects (name, description, owner_id)
SELECT 'Demo Project', 'Projeto demo para Kanban', id FROM users WHERE email='admin@local' LIMIT 1
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM kanban_columns) THEN
    INSERT INTO kanban_columns (project_id, title, position)
    SELECT p.id, 'To Do', 0 FROM projects p WHERE p.name = 'Demo Project' LIMIT 1;
    INSERT INTO kanban_columns (project_id, title, position)
    SELECT p.id, 'In Progress', 1 FROM projects p WHERE p.name = 'Demo Project' LIMIT 1;
    INSERT INTO kanban_columns (project_id, title, position)
    SELECT p.id, 'Done', 2 FROM projects p WHERE p.name = 'Demo Project' LIMIT 1;
  END IF;
END$$;
