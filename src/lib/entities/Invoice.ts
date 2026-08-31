import { Entity, PrimaryColumn, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'bigint', nullable: true, transformer: bigintNumberTransformer })
  project_id?: number | null;

  @Column({ type: 'varchar', length: 255 })
  client_name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  client_document?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_email?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  client_phone?: string | null;

  @Column({ type: 'int' })
  value!: number;

  @Column({ type: 'varchar', length: 20 })
  issue_date!: string;

  @Column({ type: 'varchar', length: 20 })
  due_date!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  asaas_customer_id?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  asaas_id?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  asaas_url?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;
}
