import { Entity, PrimaryColumn, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('plans')
export class PlanEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string; // slug estável, ex: 'basico', 'pro', 'empresarial'

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text' })
  tagline!: string;

  // Valor a exibir publicamente. Quando vazio/nulo, o front-end mostra
  // "Sob consulta" — assim o admin controla se/quando o preço real aparece.
  @Column({ type: 'varchar', length: 50, nullable: true })
  price?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  price_note?: string | null; // ex: '/mês'

  @Column({ type: 'boolean', default: false })
  featured?: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  features!: string[];

  @Column({ type: 'int', default: 0 })
  sort_order?: number;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  updated_by?: number | null; // id do admin que editou por último

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: string | null;
}
