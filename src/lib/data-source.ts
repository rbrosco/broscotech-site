import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm';

/**
 * Instância separada para o CLI do TypeORM (`typeorm migration:generate` /
 * `migration:run` / `migration:revert`), que precisa de um DataSource
 * exportado de forma síncrona — diferente de getDataSource() em
 * ./typeorm.ts, que é assíncrono e pensado para as rotas da API.
 */
const AppDataSource = new DataSource({
  ...buildDataSourceOptions(),
  migrations: ['src/lib/typeorm-migrations/*.ts'],
});

export default AppDataSource;
