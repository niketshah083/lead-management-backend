import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ConnectorType, ConnectorStatus } from '../common/enums';
import { User } from './user.entity';

@Entity('connectors')
export class Connector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ConnectorType })
  type: ConnectorType;

  @Column({
    type: 'enum',
    enum: ConnectorStatus,
    default: ConnectorStatus.DISCONNECTED,
  })
  status: ConnectorStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'webhook_url', length: 500, nullable: true, unique: true })
  webhookUrl: string;

  @Column({ name: 'webhook_secret', length: 255, nullable: true })
  webhookSecret: string;

  @Column({ name: 'oauth_access_token', type: 'text', nullable: true })
  oauthAccessToken: string;

  @Column({ name: 'oauth_refresh_token', type: 'text', nullable: true })
  oauthRefreshToken: string;

  @Column({ name: 'oauth_expires_at', type: 'datetime', nullable: true })
  oauthExpiresAt: Date;

  @Column({ name: 'oauth_scope', type: 'text', nullable: true })
  oauthScope: string;

  @Column({ name: 'external_account_id', length: 255, nullable: true })
  externalAccountId: string;

  @Column({ name: 'external_account_name', length: 255, nullable: true })
  externalAccountName: string;

  @Column({ name: 'external_page_id', length: 255, nullable: true })
  externalPageId: string;

  @Column({ name: 'external_page_name', length: 255, nullable: true })
  externalPageName: string;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({ name: 'field_mapping', type: 'json', nullable: true })
  fieldMapping: Record<string, string>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_sync_at', type: 'datetime', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string;

  @Column({ name: 'sync_interval_minutes', default: 15 })
  syncIntervalMinutes: number;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => ConnectorLog, (log) => log.connector)
  logs: ConnectorLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('connector_logs')
export class ConnectorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'connector_id' })
  connectorId: string;

  @ManyToOne(() => Connector, (connector) => connector.logs)
  @JoinColumn({ name: 'connector_id' })
  connector: Connector;

  @Column({ length: 50 })
  action: string;

  @Column({
    type: 'enum',
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info',
  })
  level: 'success' | 'error' | 'warning' | 'info';

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'raw_payload', type: 'json', nullable: true })
  rawPayload: Record<string, any>;

  @Column({ name: 'processed_data', type: 'json', nullable: true })
  processedData: Record<string, any>;

  @Column({ name: 'lead_id', nullable: true })
  leadId: string;

  @Column({ name: 'error_details', type: 'text', nullable: true })
  errorDetails: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('webhook_payloads')
export class WebhookPayload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'connector_id' })
  connectorId: string;

  @ManyToOne(() => Connector)
  @JoinColumn({ name: 'connector_id' })
  connector: Connector;

  @Column({ name: 'raw_payload', type: 'json' })
  rawPayload: Record<string, any>;

  @Column({ name: 'normalized_data', type: 'json', nullable: true })
  normalizedData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['pending', 'processed', 'failed', 'duplicate'],
    default: 'pending',
  })
  status: 'pending' | 'processed' | 'failed' | 'duplicate';

  @Column({ name: 'lead_id', nullable: true })
  leadId: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}
