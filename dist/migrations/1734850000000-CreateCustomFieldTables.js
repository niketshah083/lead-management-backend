"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomFieldTables1734850000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateCustomFieldTables1734850000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'business_types',
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
                    length: '255',
                    isUnique: true,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'icon',
                    type: 'varchar',
                    length: '100',
                    default: "'pi-briefcase'",
                },
                {
                    name: 'color',
                    type: 'varchar',
                    length: '20',
                    default: "'#3B82F6'",
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'order',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'field_definitions',
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
                    name: 'business_type_id',
                    type: 'varchar',
                    length: '36',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'label',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'field_type',
                    type: 'enum',
                    enum: [
                        'text',
                        'number',
                        'date',
                        'dropdown',
                        'multi_select',
                        'checkbox',
                        'email',
                        'phone',
                        'url',
                        'textarea',
                        'currency',
                    ],
                    default: "'text'",
                },
                {
                    name: 'placeholder',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'help_text',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'is_required',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'order',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'options',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'validation',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'default_value',
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                },
                {
                    name: 'visibility_condition',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'lead_custom_fields',
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
                    name: 'lead_id',
                    type: 'varchar',
                    length: '36',
                },
                {
                    name: 'field_definition_id',
                    type: 'varchar',
                    length: '36',
                },
                {
                    name: 'value',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'array_value',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'status_transitions',
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
                    name: 'from_status_id',
                    type: 'varchar',
                    length: '36',
                },
                {
                    name: 'to_status_id',
                    type: 'varchar',
                    length: '36',
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'requires_comment',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'allowed_roles',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        await queryRunner.query(`
      ALTER TABLE leads 
      ADD COLUMN business_type_id VARCHAR(36) NULL AFTER category_id
    `);
        await queryRunner.query(`
      ALTER TABLE lead_status_masters 
      ADD COLUMN is_initial BOOLEAN DEFAULT FALSE AFTER is_active,
      ADD COLUMN is_final BOOLEAN DEFAULT FALSE AFTER is_initial,
      ADD COLUMN status_type VARCHAR(50) NULL AFTER is_final
    `);
        await queryRunner.createForeignKey('field_definitions', new typeorm_1.TableForeignKey({
            columnNames: ['business_type_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'business_types',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('lead_custom_fields', new typeorm_1.TableForeignKey({
            columnNames: ['lead_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'leads',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('lead_custom_fields', new typeorm_1.TableForeignKey({
            columnNames: ['field_definition_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'field_definitions',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('leads', new typeorm_1.TableForeignKey({
            columnNames: ['business_type_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'business_types',
            onDelete: 'SET NULL',
        }));
        await queryRunner.createForeignKey('status_transitions', new typeorm_1.TableForeignKey({
            columnNames: ['from_status_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'lead_status_masters',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createForeignKey('status_transitions', new typeorm_1.TableForeignKey({
            columnNames: ['to_status_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'lead_status_masters',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createIndex('lead_custom_fields', new typeorm_1.TableIndex({
            name: 'IDX_LEAD_CUSTOM_FIELD_UNIQUE',
            columnNames: ['lead_id', 'field_definition_id'],
            isUnique: true,
        }));
        await queryRunner.createIndex('status_transitions', new typeorm_1.TableIndex({
            name: 'IDX_STATUS_TRANSITION_UNIQUE',
            columnNames: ['from_status_id', 'to_status_id'],
            isUnique: true,
        }));
        await queryRunner.query(`
      UPDATE lead_status_masters 
      SET is_initial = TRUE 
      WHERE name = 'New' AND deleted_at IS NULL
    `);
        await queryRunner.query(`
      UPDATE lead_status_masters 
      SET is_final = TRUE, status_type = 'positive'
      WHERE name = 'Won' AND deleted_at IS NULL
    `);
        await queryRunner.query(`
      UPDATE lead_status_masters 
      SET is_final = TRUE, status_type = 'negative'
      WHERE name = 'Lost' AND deleted_at IS NULL
    `);
    }
    async down(queryRunner) {
        const leadsTable = await queryRunner.getTable('leads');
        const leadsFk = leadsTable?.foreignKeys.find((fk) => fk.columnNames.indexOf('business_type_id') !== -1);
        if (leadsFk) {
            await queryRunner.dropForeignKey('leads', leadsFk);
        }
        await queryRunner.query(`
      ALTER TABLE leads DROP COLUMN business_type_id
    `);
        await queryRunner.query(`
      ALTER TABLE lead_status_masters 
      DROP COLUMN is_initial,
      DROP COLUMN is_final,
      DROP COLUMN status_type
    `);
        await queryRunner.dropTable('status_transitions');
        await queryRunner.dropTable('lead_custom_fields');
        await queryRunner.dropTable('field_definitions');
        await queryRunner.dropTable('business_types');
    }
}
exports.CreateCustomFieldTables1734850000000 = CreateCustomFieldTables1734850000000;
//# sourceMappingURL=1734850000000-CreateCustomFieldTables.js.map