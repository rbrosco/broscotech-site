# Migrations do banco de dados

O projeto agora usa `drizzle-kit` para versionar mudanças no schema
(`src/lib/schema.ts`), em vez de scripts avulsos rodados à mão.

## Comandos

- `pnpm db:generate` — gera um novo arquivo `.sql` em `drizzle/` a partir
  das mudanças em `src/lib/schema.ts`. Rode sempre que alterar o schema.
- `pnpm db:migrate` — aplica as migrations pendentes no banco apontado por
  `DATABASE_URL`. Registra o que já foi aplicado numa tabela de controle
  (`drizzle.__drizzle_migrations`), então rodar de novo é seguro (não
  reaplica o que já rodou).
- `pnpm db:studio` — abre uma UI local para inspecionar o banco.
- `pnpm db:push` — aplica o schema diretamente sem gerar arquivo de
  migration (bom para prototipar rápido em ambiente local; **não use em
  produção**, pois não fica registrado em lugar nenhum).

## Sobre a migration `0000_worthless_corsair.sql`

Essa é a migration "baseline" — criada a partir do schema como ele já
estava em produção (as tabelas foram criadas originalmente à mão / por
scripts avulsos em `scripts/migrate-*.js`, não por este sistema).

Por isso, editei o arquivo gerado para usar `CREATE TABLE IF NOT EXISTS`
em vez de `CREATE TABLE` — isso torna a migration segura de rodar tanto:
- num banco **novo** (staging, ambiente de um novo dev, disaster recovery):
  cria todas as 9 tabelas do zero.
- no banco de **produção já existente**: como as tabelas já existem com a
  mesma estrutura, o `IF NOT EXISTS` faz essas linhas não fazerem nada —
  mas o drizzle-kit ainda registra a migration 0000 como aplicada na
  tabela de controle, estabelecendo o baseline. A partir daí, `pnpm
  db:generate` + `pnpm db:migrate` funciona normalmente para qualquer
  mudança futura no schema.

**Passo a passo para adotar em produção:**
1. Faça um backup do banco antes (sempre, antes de rodar qualquer migration
   pela primeira vez).
2. Rode `DATABASE_URL=... pnpm db:migrate` uma vez.
3. Confirme que voltou sem erro e que a tabela `drizzle.__drizzle_migrations`
   foi criada com uma linha para `0000_worthless_corsair`.
4. Dali em diante, qualquer mudança no schema segue o fluxo normal:
   editar `schema.ts` → `pnpm db:generate` → revisar o SQL gerado →
   `pnpm db:migrate`.

## O que os scripts antigos (`scripts/migrate-*.js`) não tinham

- Não ficava registrado em lugar nenhum o que já tinha sido aplicado —
  rodar duas vezes por engano podia falhar ou duplicar dados.
- Não davam para reverter nem auditar em ordem.
- Um deles (`migrate-invoices.js`) tinha a senha do banco commitada em
  texto puro no código (já corrigido em commit anterior desta branch).

Os scripts `migrate-ai.js`, `migrate-image.js`, `migrate-missing.js` e
`migrate-notifications.js` da raiz do projeto já foram removidos (código
morto, não referenciado em lugar nenhum) numa limpeza anterior desta
branch — o histórico deles continua no git caso precise consultar o que
faziam.
