"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLeadStatusMaster1734720000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateLeadStatusMaster1734720000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'lead_status_masters',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'description',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'color',
                    type: 'varchar',
                    default: "'#3B82F6'",
                },
                {
                    name: 'bgColor',
                    type: 'varchar',
                    default: "'#EFF6FF'",
                },
                {
                    name: 'icon',
                    type: 'varchar',
                    default: "'pi-inbox'",
                },
                {
                    name: 'order',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
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
        const table = await queryRunner.getTable('leads');
        const statusMasterIdColumn = table?.columns.find((column) => column.name === 'status_master_id');
        if (!statusMasterIdColumn) {
            await queryRunner.addColumn('leads', new (require('typeorm').TableColumn)({
                name: 'status_master_id',
                type: 'varchar',
                isNullable: true,
            }));
        }
        const foreignKeys = table?.foreignKeys || [];
        const statusMasterForeignKey = foreignKeys.find((fk) => fk.columnNames.includes('status_master_id'));
        if (!statusMasterForeignKey) {
            await queryRunner.createForeignKey('leads', new typeorm_1.TableForeignKey({
                columnNames: ['status_master_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'lead_status_masters',
                onDelete: 'SET NULL',
            }));
        }
        await queryRunner.query(`
      INSERT INTO lead_status_masters (id, name, description, color, bgColor, icon, \`order\`, isActive, created_at, updated_at)
      VALUES
        (UUID(), 'New', 'New leads', '#3B82F6', '#EFF6FF', 'pi-inbox', 0, true, NOW(), NOW()),
        (UUID(), 'Contacted', 'Lead contacted', '#F59E0B', '#FEF3C7', 'pi-phone', 1, true, NOW(), NOW()),
        (UUID(), 'Qualified', 'Lead qualified', '#8B5CF6', '#F3E8FF', 'pi-check-circle', 2, true, NOW(), NOW()),
        (UUID(), 'Negotiation', 'In negotiation', '#EC4899', '#FCE7F3', 'pi-comments', 3, true, NOW(), NOW()),
        (UUID(), 'Won', 'Deal won', '#10B981', '#D1FAE5', 'pi-trophy', 4, true, NOW(), NOW()),
        (UUID(), 'Lost', 'Deal lost', '#EF4444', '#FEE2E2', 'pi-times-circle', 5, true, NOW(), NOW())
    `);
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable('leads');
        if (table) {
            const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('status_master_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('leads', foreignKey);
            }
        }
        await queryRunner.dropColumn('leads', 'status_master_id');
        await queryRunner.dropTable('lead_status_masters');
    }
}
exports.CreateLeadStatusMaster1734720000000 = CreateLeadStatusMaster1734720000000;
//# sourceMappingURL=1734720000000-CreateLeadStatusMaster.js.map