import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('ai_messages')
export class AiMessageEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  session_id!: string;

  @Column({ type: 'varchar', length: 50 })
  role!: string; // 'client' | 'agent' | 'admin'

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  image_url?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;
}
