import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateConnectorTables1734780000000 implements MigrationInterface {
  name = 'CreateConnectorTables1734780000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create connectors table
    await queryRunner.createTable(
      new Table({
        name: 'connectors',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'webhook',
              'meta',
              'google',
              'youtube',
              'linkedin',
              'whatsapp',
            ],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['connected', 'disconnected', 'error', 'pending'],
            default: "'disconnected'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'webhook_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'oauth_access_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'oauth_refresh_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'oauth_expires_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'oauth_scope',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'external_account_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'external_account_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'external_page_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'external_page_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'config',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'field_mapping',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_sync_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sync_interval_minutes',
            type: 'int',
            default: 15,
          },
          {
            name: 'created_by_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create connector_logs table
    await queryRunner.createTable(
      new Table({
        name: 'connector_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'connector_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'level',
            type: 'enum',
            enum: ['success', 'error', 'warning', 'info'],
            default: "'info'",
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'raw_payload',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'processed_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'lead_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'error_details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create webhook_payloads table
    await queryRunner.createTable(
      new Table({
        name: 'webhook_payloads',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'connector_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'raw_payload',
            type: 'json',
          },
          {
            name: 'normalized_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processed', 'failed', 'duplicate'],
            default: "'pending'",
          },
          {
            name: 'lead_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'processed_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'connectors',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'connector_logs',
      new TableForeignKey({
        columnNames: ['connector_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'connectors',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'webhook_payloads',
      new TableForeignKey({
        columnNames: ['connector_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'connectors',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'connectors',
      new TableIndex({
        name: 'IDX_connectors_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'connectors',
      new TableIndex({
        name: 'IDX_connectors_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'connector_logs',
      new TableIndex({
        name: 'IDX_connector_logs_connector_id',
        columnNames: ['connector_id'],
      }),
    );

    await queryRunner.createIndex(
      'connector_logs',
      new TableIndex({
        name: 'IDX_connector_logs_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_payloads',
      new TableIndex({
        name: 'IDX_webhook_payloads_connector_id',
        columnNames: ['connector_id'],
      }),
    );

    await queryRunner.createIndex(
      'webhook_payloads',
      new TableIndex({
        name: 'IDX_webhook_payloads_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_payloads');
    await queryRunner.dropTable('connector_logs');
    await queryRunner.dropTable('connectors');
  }
}
