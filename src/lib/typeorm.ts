import 'reflect-metadata';
import { DataSource } from 'typeorm';
import pg from 'pg';
import {
  UserEntity,
  ProjectEntity,
  ProjectUpdateEntity,
  KanbanColumnEntity,
  KanbanCardEntity,
  InvoiceEntity,
  NotificationEntity,
  AiSessionEntity,
  AiMessageEntity,
  LeadEntity,
  PlanEntity,
} from './entities';

declare global {
  // eslint-disable-next-line no-var
  var __typeormDataSource: DataSource | undefined;
}

export function buildDataSourceOptions() {
  const connectionString = process.env.DATABASE_URL;

  const entities = [
    UserEntity,
    ProjectEntity,
    ProjectUpdateEntity,
    KanbanColumnEntity,
    KanbanCardEntity,
    InvoiceEntity,
    NotificationEntity,
    AiSessionEntity,
    AiMessageEntity,
    LeadEntity,
    PlanEntity,
  ];

  const sync = process.env.TYPEORM_SYNCHRONIZE === 'true';

  if (connectionString) {
    return { type: 'postgres' as const, url: connectionString, entities, synchronize: sync, logging: false, driver: pg };
  }

  const host = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? 'localhost';
  const username = process.env.PGUSER ?? process.env.POSTGRES_USER ?? 'postgres';
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? '';
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DB ?? 'postgres';
  const portRaw = process.env.PGPORT ?? process.env.POSTGRES_PORT;
  const port = portRaw ? Number(portRaw) : 5432;

  return { type: 'postgres' as const, host, port, username, password, database, entities, synchronize: sync, logging: false, driver: pg };
}

function createDataSource(): DataSource {
  return new DataSource(buildDataSourceOptions());
}

let initPromise: Promise<DataSource> | null = null;

/**
 * Retorna o DataSource já inicializado (conectado). Reaproveita a mesma
 * instância entre requisições (e entre reloads do HMR em dev, via
 * globalThis) para não abrir uma conexão nova a cada chamada de rota.
 */
export async function getDataSource(): Promise<DataSource> {
  if (globalThis.__typeormDataSource?.isInitialized) {
    return globalThis.__typeormDataSource;
  }

  if (!initPromise) {
    const ds = globalThis.__typeormDataSource ?? createDataSource();
    initPromise = ds
      .initialize()
      .then((initialized) => {
        if (process.env.NODE_ENV !== 'production') {
          globalThis.__typeormDataSource = initialized;
        }
        return initialized;
      })
      .catch((err) => {
        initPromise = null;
        globalThis.__typeormDataSource = undefined;
        throw err;
      });
  }

  return initPromise;
}
