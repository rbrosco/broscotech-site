import { Entity, PrimaryColumn, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('ai_sessions')
export class AiSessionEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'bigint', transformer: bigintNumberTransformer })
  project_id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: string | null;
}
