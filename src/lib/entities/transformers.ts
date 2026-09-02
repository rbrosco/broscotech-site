import { ValueTransformer } from 'typeorm';

/**
 * O driver `pg` retorna colunas BIGINT como string (para não perder
 * precisão em números maiores que Number.MAX_SAFE_INTEGER). O projeto
 * sempre tratou esses IDs como number (mode: 'number' no schema Drizzle
 * anterior), então este transformer mantém o mesmo comportamento.
 */
export const bigintNumberTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? value : Number(value)),
};
