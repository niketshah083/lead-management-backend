"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddLeadBusinessFields1734619600000 = void 0;
const typeorm_1 = require("typeorm");
class AddLeadBusinessFields1734619600000 {
    name = 'AddLeadBusinessFields1734619600000';
    async up(queryRunner) {
        await queryRunner.addColumn('leads', new typeorm_1.TableColumn({
            name: 'businessName',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
        await queryRunner.addColumn('leads', new typeorm_1.TableColumn({
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
        await queryRunner.addColumn('leads', new typeorm_1.TableColumn({
            name: 'pincode',
            type: 'varchar',
            length: '20',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('leads', 'pincode');
        await queryRunner.dropColumn('leads', 'email');
        await queryRunner.dropColumn('leads', 'businessName');
    }
}
exports.AddLeadBusinessFields1734619600000 = AddLeadBusinessFields1734619600000;
//# sourceMappingURL=1734619600000-AddLeadBusinessFields.js.map