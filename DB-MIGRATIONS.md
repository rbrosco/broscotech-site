# Migrations do banco de dados

O projeto usa **TypeORM** (com o CLI de migrations) para versionar mudanças
no schema (`src/lib/entities/`). Anteriormente usava Drizzle — a
branch `Claude_fix` migrou tudo para TypeORM.

## Comandos

- `pnpm db:generate` — gera um novo arquivo de migration em
  `src/lib/typeorm-migrations/`, comparando as entities com o banco
  apontado por `DATABASE_URL`. **Diferente do drizzle-kit, isso exige uma
  conexão real com o banco** (o TypeORM introspecciona o banco de verdade
  para calcular o diff, não só lê as entities). Rode sempre que alterar
  uma entity em `src/lib/entities/`.
- `pnpm db:migrate` — aplica as migrations pendentes no banco. Registra o
  que já foi aplicado numa tabela de controle (`migrations`), então rodar
  de novo é seguro.
- `pnpm db:revert` — reverte a última migration aplicada (roda o `down()`
  dela). A migration baseline não tem `down()` implementado de propósito
  (ver abaixo).

Todos os três comandos precisam de `DATABASE_URL` configurado no ambiente
(ex: `DATABASE_URL=postgres://... pnpm db:migrate`).

## Sobre a migration baseline (`1735660800000-Baseline.ts`)

Essa migration foi **escrita à mão**, não gerada por `db:generate` — não
havia banco disponível neste ambiente para o TypeORM rodar o diff contra
ele. Ela espelha exatamente as entities em `src/lib/entities/`.

Assim como a baseline anterior (da fase em que o projeto usava
drizzle-kit), usa `CREATE TABLE IF NOT EXISTS` — segura tanto num banco
**novo** (cria as 9 tabelas do zero) quanto no banco de **produção já
existente** (as tabelas já existem, viram no-op, mas o TypeORM ainda
registra a migration como aplicada, estabelecendo o baseline).

**Passo a passo para adotar em produção:**
1. Faça um backup do banco antes.
2. Rode `DATABASE_URL=... pnpm db:migrate` uma vez.
3. Confirme que voltou sem erro e que a tabela `migrations` foi criada com
   uma linha para `Baseline1735660800000`.
4. Dali em diante, qualquer mudança de schema segue o fluxo normal: editar
   a entity → `pnpm db:generate` (com `DATABASE_URL` configurado) →
   revisar o SQL gerado → `pnpm db:migrate`.

**Importante:** como o `db:generate` precisa de conexão real, gere as
próximas migrations localmente (ou num ambiente de staging) com o banco
acessível — não dá para gerar offline como no drizzle-kit.

## Notas técnicas

- O CLI do TypeORM roda via `ts-node`, que não entende o
  `moduleResolution: "bundler"` usado pelo `tsconfig.json` principal
  (esse é specific do Next.js/webpack). Por isso existe um
  `tsconfig.typeorm.json` separado (module: commonjs, moduleResolution:
  node) usado só para os comandos `db:*` — os scripts no `package.json`
  já apontam `TS_NODE_PROJECT` para ele automaticamente.
- `src/lib/data-source.ts` é usado só pelo CLI (precisa de um `DataSource`
  exportado de forma síncrona). As rotas da API usam
  `src/lib/typeorm.ts` (`getDataSource()`, assíncrono, com pooling
  reaproveitado entre requisições/HMR).

## O que os scripts antigos (`scripts/migrate-*.js`, já removidos) não tinham

- Não ficava registrado em lugar nenhum o que já tinha sido aplicado —
  rodar duas vezes por engano podia falhar ou duplicar dados.
- Não davam para reverter nem auditar em ordem.
- Um deles (`migrate-invoices.js`) tinha a senha do banco commitada em
  texto puro no código (corrigido antes desta migração de ORM).
