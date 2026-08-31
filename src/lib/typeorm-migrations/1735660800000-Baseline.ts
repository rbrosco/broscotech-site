import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration baseline — escrita à mão, não gerada por `migration:generate`.
 *
 * O `migration:generate` do TypeORM precisa se conectar a um banco de
 * verdade para comparar contra as entities (diferente do drizzle-kit, que
 * conseguia gerar offline só a partir do schema). Sem DATABASE_URL neste
 * ambiente, não dava para rodar o diff — então esta migration foi escrita
 * manualmente, espelhando exatamente as entities em src/lib/entities/.
 *
 * Assim como a baseline do drizzle-kit que existiu antes desta branch
 * trocar de ORM, usa CREATE TABLE IF NOT EXISTS: segura tanto num banco
 * novo (cria as 9 tabelas do zero) quanto no banco de produção já
 * existente (as tabelas já existem, então essas linhas viram no-op — mas
 * o TypeORM ainda registra esta migration como aplicada, estabelecendo o
 * baseline para as próximas mudanças de schema seguirem o fluxo normal).
 */
export class Baseline1735660800000 implements MigrationInterface {
  name = 'Baseline1735660800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" bigserial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "login" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" text NOT NULL,
        "phone" varchar(50),
        "role" varchar(50),
        "created_at" timestamp,
        "updated_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" bigserial PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "title" varchar(255) NOT NULL,
        "status" varchar(100),
        "progress" integer,
        "created_at" timestamp,
        "updated_at" timestamp,
        "client_name" varchar(255),
        "client_email" varchar(255),
        "client_phone" varchar(50),
        "project_type" varchar(100),
        "final_date" varchar(20),
        "language" varchar(50),
        "framework" varchar(50),
        "integrations" text,
        "admin_status" varchar(20)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "project_updates" (
        "id" bigserial PRIMARY KEY,
        "project_id" bigint NOT NULL,
        "kind" varchar(50),
        "message" text,
        "created_at" timestamp
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "kanban_columns" (
        "id" bigserial PRIMARY KEY,
        "project_id" bigint NOT NULL,
        "title" varchar(255),
        "position" integer
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "kanban_cards" (
        "id" bigserial PRIMARY KEY,
        "column_id" bigint NOT NULL,
        "title" varchar(255),
        "description" text,
        "position" integer
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" varchar(50) PRIMARY KEY,
        "project_id" bigint,
        "client_name" varchar(255) NOT NULL,
        "client_document" varchar(20),
        "client_email" varchar(255),
        "client_phone" varchar(50),
        "value" integer NOT NULL,
        "issue_date" varchar(20) NOT NULL,
        "due_date" varchar(20) NOT NULL,
        "status" varchar(50) NOT NULL,
        "description" text,
        "asaas_customer_id" varchar(100),
        "asaas_id" varchar(100),
        "asaas_url" varchar(255),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" varchar(100) PRIMARY KEY,
        "user_id" bigint,
        "project_id" bigint,
        "message" text NOT NULL,
        "card_id" bigint,
        "to_column_id" bigint,
        "read" boolean DEFAULT false,
        "timestamp" bigint,
        "created_at" timestamp DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_sessions" (
        "id" varchar(100) PRIMARY KEY,
        "project_id" bigint NOT NULL,
        "title" varchar(255) NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_messages" (
        "id" varchar(100) PRIMARY KEY,
        "session_id" varchar(100) NOT NULL,
        "role" varchar(50) NOT NULL,
        "content" text NOT NULL,
        "image_url" text,
        "created_at" timestamp DEFAULT now()
      );
    `);
  }

  public async down(): Promise<void> {
    // Baseline não reverte de propósito — evita apagar dados de produção
    // sem querer com um `migration:revert` acidental.
    throw new Error('A migration baseline não é reversível. Restaure a partir de um backup se precisar desfazer.');
  }
}
