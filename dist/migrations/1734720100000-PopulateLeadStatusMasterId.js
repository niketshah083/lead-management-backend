"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopulateLeadStatusMasterId1734720100000 = void 0;
class PopulateLeadStatusMasterId1734720100000 {
    async up(queryRunner) {
        const statusMapping = {
            new: 'New',
            contacted: 'Contacted',
            qualified: 'Qualified',
            negotiation: 'Negotiation',
            won: 'Won',
            lost: 'Lost',
        };
        for (const [enumStatus, masterName] of Object.entries(statusMapping)) {
            await queryRunner.query(`
        UPDATE leads l
        INNER JOIN lead_status_masters lsm ON lsm.name = ?
        SET l.status_master_id = lsm.id
        WHERE l.status = ? AND l.deleted_at IS NULL AND lsm.deleted_at IS NULL
      `, [masterName, enumStatus]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
      UPDATE leads SET status_master_id = NULL WHERE deleted_at IS NULL
    `);
    }
}
exports.PopulateLeadStatusMasterId1734720100000 = PopulateLeadStatusMasterId1734720100000;
//# sourceMappingURL=1734720100000-PopulateLeadStatusMasterId.js.map