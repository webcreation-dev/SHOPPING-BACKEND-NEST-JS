import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewNew1733522296966 implements MigrationInterface {
    name = 'AddNewNew1733522296966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_wishlist_property" (
                "userId" integer NOT NULL,
                "propertyId" integer NOT NULL,
                CONSTRAINT "PK_6bb40f1c9689b22e3bcb185a46b" PRIMARY KEY ("userId", "propertyId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4af1bd0fd3a85baa0422690a4f" ON "user_wishlist_property" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_de1530b78db22bdbe885036713" ON "user_wishlist_property" ("propertyId")
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wishlist_property"
            ADD CONSTRAINT "FK_4af1bd0fd3a85baa0422690a4ff" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wishlist_property"
            ADD CONSTRAINT "FK_de1530b78db22bdbe885036713a" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_wishlist_property" DROP CONSTRAINT "FK_de1530b78db22bdbe885036713a"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wishlist_property" DROP CONSTRAINT "FK_4af1bd0fd3a85baa0422690a4ff"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_de1530b78db22bdbe885036713"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4af1bd0fd3a85baa0422690a4f"
        `);
        await queryRunner.query(`
            DROP TABLE "user_wishlist_property"
        `);
    }

}
