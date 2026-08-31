import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[drizzle-kit] DATABASE_URL não definido. Comandos como "db:generate" ainda funcionam ' +
    '(não precisam de conexão), mas "db:migrate" e "db:studio" vão falhar sem essa variável.'
  );
}

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
