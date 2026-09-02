import { Entity, PrimaryColumn, Generated, Column } from 'typeorm';
import { bigintNumberTransformer } from './transformers';

/**
 * Lead captado pelos CTAs do site institucional (seção "Serviços" e
 * seção "Portfólio"). Guarda qual opção específica a pessoa escolheu
 * (interest_type + interest_label) para o time saber exatamente o que
 * ela quer sem precisar perguntar de novo.
 */
@Entity('leads')
export class LeadEntity {
  @PrimaryColumn({ type: 'bigint', transformer: bigintNumberTransformer })
  @Generated('increment')
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  email?: string | null;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  /** 'service' (Solicitar Proposta) ou 'portfolio' (Quero um projeto assim). */
  @Column({ type: 'text' })
  interest_type!: string;

  /** id estável do serviço/projeto (ex: 'saas-webapps', 'easydev-crm'). */
  @Column({ type: 'text', nullable: true })
  interest_id?: string | null;

  /** título legível do serviço/projeto escolhido, para exibir direto no CRM. */
  @Column({ type: 'text', nullable: true })
  interest_label?: string | null;

  /** 'new' | 'contacted' | 'won' | 'lost' — status simples de funil. */
  @Column({ type: 'text', default: 'new' })
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: string | null;
}
