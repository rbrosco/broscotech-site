import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('projects')
export class ProjectEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'bigint', transformer: bigintNumberTransformer })
  user_id!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  status?: string | null;

  @Column({ type: 'int', nullable: true })
  progress?: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  created_at?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at?: string | null;

  @Column({ type: 'text', nullable: true })
  client_name?: string | null;

  @Column({ type: 'text', nullable: true })
  client_email?: string | null;

  @Column({ type: 'text', nullable: true })
  client_phone?: string | null;

  @Column({ type: 'text', nullable: true })
  project_type?: string | null;

  @Column({ type: 'date', nullable: true })
  final_date?: string | null;

  @Column({ type: 'text', nullable: true })
  language?: string | null;

  @Column({ type: 'text', nullable: true })
  framework?: string | null;

  @Column({ type: 'text', nullable: true })
  integrations?: string | null;

  @Column({ type: 'text', nullable: true })
  admin_status?: string | null;

  // Nome da instância Evolution API (WhatsApp) do dev responsável por este
  // projeto — define de qual número saem as notificações automáticas.
  // Ver EVOLUTION_DEFAULT_INSTANCE em src/lib/evolution.ts para o fallback.
  // Coluna já existe no banco (aplicada manualmente via ALTER TABLE) e está
  // em uso ativo em src/app/api/project_updates/route.ts e src/lib/evolution.ts.
  @Column({ type: 'text', nullable: true })
  assigned_dev?: string | null;
}
