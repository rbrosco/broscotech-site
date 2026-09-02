import { Entity, PrimaryColumn, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  user_id?: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  project_id?: number | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  card_id?: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  to_column_id?: number | null;

  @Column({ type: 'boolean', default: false })
  read?: boolean;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  timestamp?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;
}
