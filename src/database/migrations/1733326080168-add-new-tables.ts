import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTables1733326080168 implements MigrationInterface {
    name = 'AddNewTables1733326080168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "location" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "latitude" numeric(10, 6) NOT NULL,
                "longitude" numeric(10, 6) NOT NULL,
                CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "gallery" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "propertyId" uuid,
                CONSTRAINT "PK_65d7a1ef91ddafb3e7071b188a0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "property" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "price" numeric(6, 2) NOT NULL,
                "locationId" uuid,
                CONSTRAINT "REL_d285b373822984e1951c21a3c1" UNIQUE ("locationId"),
                CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_d285b373822984e1951c21a3c18" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_d285b373822984e1951c21a3c18"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            DROP TABLE "property"
        `);
        await queryRunner.query(`
            DROP TABLE "gallery"
        `);
        await queryRunner.query(`
            DROP TABLE "location"
        `);
    }

}
