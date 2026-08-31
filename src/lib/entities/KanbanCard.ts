import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('kanban_cards')
export class KanbanCardEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  column_id?: number | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int' })
  position!: number;

  // Colunas presentes no banco (schema legado) mas ainda não usadas pela
  // aplicação. Mapeadas para não quebrar o synchronize; podem ser ligadas
  // a uma feature de "responsável pelo card" futuramente.
  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  assignee_id?: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  created_at?: string | null;

  // Nome livre do responsável pela tarefa (exibido no card).
  @Column({ type: 'text', nullable: true })
  responsavel?: string | null;

  // Prazo da tarefa.
  @Column({ type: 'date', nullable: true })
  due_date?: string | null;

  // 'baixa' | 'media' | 'alta'
  @Column({ type: 'text', nullable: true })
  priority?: string | null;
}
