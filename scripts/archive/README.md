# Scripts arquivados

Estes scripts eram usados para corrigir/preparar o schema do banco de
produção **antes** de o projeto adotar migrations versionadas do TypeORM
(ver `DB-MIGRATIONS.md` na raiz). Já cumpriram o papel deles e não fazem
parte do fluxo atual (`pnpm db:generate` / `pnpm db:migrate`), mas foram
mantidos aqui — arquivados, não apagados — porque documentam correções
reais aplicadas em produção e podem servir de referência caso o mesmo
problema apareça em outro ambiente (ex.: um banco clonado de um backup
antigo, sem essas colunas).

**Não usar como fluxo normal de schema.** Para qualquer mudança de schema
nova, siga `DB-MIGRATIONS.md` (editar entity → `db:generate` → revisar →
`db:migrate`).

## fix-invoices-columns.mjs

Adiciona à tabela `invoices` de produção as colunas que `InvoiceEntity`
já esperava mas que nunca tinham sido criadas no banco real
(`client_document`, `client_email`, `client_phone`, `asaas_customer_id`),
o que causava `column i.client_document does not exist` (42703) em
qualquer SELECT/INSERT via TypeORM em `/api/invoices`.

Uso histórico: `node --env-file=.env scripts/archive/fix-invoices-columns.mjs`
(requer `DATABASE_URL` ou `PGHOST`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`/`PGPORT`).

## migrate-invoices.js

Cria a tabela `invoices` do zero (`CREATE TABLE IF NOT EXISTS`) na época
em que ela ainda não existia no banco. Superado pela migration baseline
do TypeORM, que já cobre a criação de todas as tabelas via
`pnpm db:migrate`.

Nota histórica (ver `DB-MIGRATIONS.md`): a versão original deste script
chegou a ter a senha do banco commitada em texto puro — já corrigido
para ler de `DATABASE_URL` antes de este script ser arquivado.

## create-admin.js

Cria (ou promove a admin, se já existir por `login`/`email`) o usuário
`admin` / `admin@easydev.com.br` com senha `admin` via bcrypt. Útil para
bootstrap de um ambiente novo sem acesso direto ao banco.

**Atenção:** cria a senha padrão `admin` em texto — troque-a imediatamente
após o primeiro login se usar este script em qualquer ambiente acessível
publicamente.
