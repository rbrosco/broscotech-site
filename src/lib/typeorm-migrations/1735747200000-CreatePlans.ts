import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cria a tabela `plans` (planos de preço editáveis pelo admin em
 * /dev/planos) e popula com os 3 planos que hoje estão hardcoded em
 * src/component/Planos.tsx (Básico, Pro, Empresarial) — sem preço
 * definido, então o front-end mostra "Sob consulta" até o admin
 * preencher um valor real.
 *
 * Usa CREATE TABLE IF NOT EXISTS + INSERT ... ON CONFLICT DO NOTHING
 * pelo mesmo motivo da migration baseline: segura de rodar tanto num
 * banco novo quanto num banco que já tenha essa tabela (ex: criada via
 * TYPEORM_SYNCHRONIZE=true em dev).
 */
export class CreatePlans1735747200000 implements MigrationInterface {
  name = 'CreatePlans1735747200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" varchar(50) PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "tagline" text NOT NULL,
        "price" varchar(50),
        "price_note" varchar(20),
        "featured" boolean DEFAULT false,
        "features" jsonb DEFAULT '[]',
        "sort_order" integer DEFAULT 0,
        "updated_by" bigint,
        "updated_at" timestamp
      );
    `);

    await queryRunner.query(`
      INSERT INTO "plans" ("id", "name", "tagline", "featured", "features", "sort_order") VALUES
      ('basico', 'Básico', 'Para quem já tem o site/sistema pronto e quer tranquilidade.', false,
        '["Hospedagem e infraestrutura incluídas","Pequenos ajustes e correções (até X/mês)","Monitoramento e backup automático","Acesso ao portal EasyDev CRM (acompanhamento e faturas)"]'::jsonb, 0),
      ('pro', 'Pro', 'Para quem quer evoluir o produto continuamente, não só mantê-lo.', true,
        '["Tudo do plano Básico","Horas de desenvolvimento novo incluídas por mês","Prioridade no suporte e no agente de IA","Kanban do projeto com atualizações em tempo real"]'::jsonb, 1),
      ('empresarial', 'Empresarial', 'Para operações maiores, com integrações e SLA dedicado.', false,
        '["Tudo do plano Pro","Integrações e automações sob medida (n8n, APIs)","SLA de suporte dedicado","Onboarding e portal EasyDev CRM personalizados"]'::jsonb, 2)
      ON CONFLICT ("id") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "plans";`);
  }
}
