import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewField1733326303478 implements MigrationInterface {
    name = 'AddNewField1733326303478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "deletedAt" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "deletedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "updated_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "created_at"
        `);
    }

}
