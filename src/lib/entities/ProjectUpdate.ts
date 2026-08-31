import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('project_updates')
export class ProjectUpdateEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'bigint', transformer: bigintNumberTransformer })
  project_id!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kind?: string | null;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;
}
