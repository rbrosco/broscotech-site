import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  login!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true })
  role?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: string | null;
}
