import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLeadBusinessFields1734619600000 implements MigrationInterface {
  name = 'AddLeadBusinessFields1734619600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add businessName column (camelCase)
    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'businessName',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add email column
    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add pincode column
    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'pincode',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('leads', 'pincode');
    await queryRunner.dropColumn('leads', 'email');
    await queryRunner.dropColumn('leads', 'businessName');
  }
}
