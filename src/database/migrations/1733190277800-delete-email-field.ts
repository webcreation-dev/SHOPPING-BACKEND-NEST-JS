import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteEmailField1733190277800 implements MigrationInterface {
    name = 'DeleteEmailField1733190277800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "email"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "email" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
        `);
    }

}
