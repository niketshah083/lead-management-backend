import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateLeadStatusMasterId1734720100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Map enum status values to status master names
    const statusMapping = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost',
    };

    // Update leads with statusMasterId based on their current status
    for (const [enumStatus, masterName] of Object.entries(statusMapping)) {
      await queryRunner.query(
        `
        UPDATE leads l
        INNER JOIN lead_status_masters lsm ON lsm.name = ?
        SET l.status_master_id = lsm.id
        WHERE l.status = ? AND l.deleted_at IS NULL AND lsm.deleted_at IS NULL
      `,
        [masterName, enumStatus],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clear statusMasterId on rollback
    await queryRunner.query(`
      UPDATE leads SET status_master_id = NULL WHERE deleted_at IS NULL
    `);
  }
}
