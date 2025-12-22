import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateConnectorTables1734780000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
