import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  login: varchar('login', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: text('password').notNull(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 50 }),
  created_at: timestamp('created_at', { mode: 'string' }),
  updated_at: timestamp('updated_at', { mode: 'string' }),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  status: varchar('status', { length: 100 }),
  progress: integer('progress'),
  created_at: timestamp('created_at', { mode: 'string' }),
  updated_at: timestamp('updated_at', { mode: 'string' }),
  client_name: varchar('client_name', { length: 255 }),
  client_email: varchar('client_email', { length: 255 }),
  client_phone: varchar('client_phone', { length: 50 }),
  project_type: varchar('project_type', { length: 100 }),
  final_date: varchar('final_date', { length: 20 }),
  language: varchar('language', { length: 50 }),
  framework: varchar('framework', { length: 50 }),
  integrations: text('integrations'),
  admin_status: varchar('admin_status', { length: 20 }),
});

export const project_updates = pgTable('project_updates', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull(),
  kind: varchar('kind', { length: 50 }),
  message: text('message'),
  created_at: timestamp('created_at', { mode: 'string' }),
});

export const kanban_columns = pgTable('kanban_columns', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull(),
  title: varchar('title', { length: 255 }),
  position: integer('position'),
});

export const kanban_cards = pgTable('kanban_cards', {
  id: serial('id').primaryKey(),
  column_id: integer('column_id').notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  position: integer('position'),
});
