import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('kanban_columns')
export class KanbanColumnEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  project_id?: number | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'int' })
  position!: number;
}
