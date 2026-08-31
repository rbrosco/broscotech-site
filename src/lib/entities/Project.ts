import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('projects')
export class ProjectEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'bigint', transformer: bigintNumberTransformer })
  user_id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  status?: string | null;

  @Column({ type: 'int', nullable: true })
  progress?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_name?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_email?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  client_phone?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project_type?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  final_date?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  framework?: string | null;

  @Column({ type: 'text', nullable: true })
  integrations?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  admin_status?: string | null;

  // Nome da instância Evolution API (WhatsApp) do dev responsável por este
  // projeto — define de qual número saem as notificações automáticas.
  // Ver EVOLUTION_DEFAULT_INSTANCE em src/lib/evolution.ts para o fallback.
  @Column({ type: 'varchar', length: 100, nullable: true })
  assigned_dev?: string | null;
}
