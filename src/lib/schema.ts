

import { pgTable, integer, bigint, bigserial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
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
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  user_id: bigint('user_id', { mode: 'number' }).notNull(),
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
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  project_id: bigint('project_id', { mode: 'number' }).notNull(),
  kind: varchar('kind', { length: 50 }),
  message: text('message'),
  created_at: timestamp('created_at', { mode: 'string' }),
});

export const kanban_columns = pgTable('kanban_columns', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  project_id: bigint('project_id', { mode: 'number' }).notNull(),
  title: varchar('title', { length: 255 }),
  position: integer('position'),
});

export const kanban_cards = pgTable('kanban_cards', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  column_id: bigint('column_id', { mode: 'number' }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  position: integer('position'),
});

export const invoices = pgTable('invoices', {
  id: varchar('id', { length: 50 }).primaryKey(),
  project_id: bigint('project_id', { mode: 'number' }),
  client_name: varchar('client_name', { length: 255 }).notNull(),
  client_document: varchar('client_document', { length: 20 }), // CPF ou CNPJ — obrigatório para criar cobrança automática no Asaas
  client_email: varchar('client_email', { length: 255 }),
  client_phone: varchar('client_phone', { length: 50 }),
  value: integer('value').notNull(),
  issue_date: varchar('issue_date', { length: 20 }).notNull(),
  due_date: varchar('due_date', { length: 20 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  description: text('description'),
  asaas_customer_id: varchar('asaas_customer_id', { length: 100 }),
  asaas_id: varchar('asaas_id', { length: 100 }),
  asaas_url: varchar('asaas_url', { length: 255 }),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 100 }).primaryKey(),
  user_id: bigint('user_id', { mode: 'number' }),
  project_id: bigint('project_id', { mode: 'number' }),
  message: text('message').notNull(),
  card_id: bigint('card_id', { mode: 'number' }),
  to_column_id: bigint('to_column_id', { mode: 'number' }),
  read: boolean('read').default(false),
  timestamp: bigint('timestamp', { mode: 'number' }),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
});
export const ai_sessions = pgTable('ai_sessions', {
  id: varchar('id', { length: 100 }).primaryKey(),
  project_id: bigint('project_id', { mode: 'number' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow(),
});

export const ai_messages = pgTable('ai_messages', {
  id: varchar('id', { length: 100 }).primaryKey(),
  session_id: varchar('session_id', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'client', 'agent', 'admin'
  content: text('content').notNull(),
  image_url: text('image_url'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow(),
});
