import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTables1733512265631 implements MigrationInterface {
    name = 'AddNewTables1733512265631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"),
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "price" numeric(6, 2) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"),
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "order_item" (
                "orderId" integer NOT NULL,
                "productId" integer NOT NULL,
                "quantity" integer NOT NULL,
                "price" numeric(6, 2) NOT NULL,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a" PRIMARY KEY ("orderId", "productId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "order" (
                "id" SERIAL NOT NULL,
                "status" "public"."order_status_enum" NOT NULL DEFAULT 'AWAITING_PAYMENT',
                "customerId" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "location" (
                "id" SERIAL NOT NULL,
                "latitude" numeric(10, 6) NOT NULL,
                "longitude" numeric(10, 6) NOT NULL,
                CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "gallery" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "propertyId" integer,
                CONSTRAINT "PK_65d7a1ef91ddafb3e7071b188a0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "property" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "price" numeric(6, 2) NOT NULL,
                "user_id" integer,
                "locationId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "REL_d285b373822984e1951c21a3c1" UNIQUE ("locationId"),
                CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."role_enum" NOT NULL DEFAULT 'ADMIN',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "product_to_category" (
                "productId" integer NOT NULL,
                "categoryId" integer NOT NULL,
                CONSTRAINT "PK_ead833542a5bf513c93bc12b016" PRIMARY KEY ("productId", "categoryId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c4ec20a1cb494c9c3e34c8da10" ON "product_to_category" ("productId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70eb26cea4105a27ce856dca20" ON "product_to_category" ("categoryId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_723792fc2012f8a4c47915d1e25" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_d285b373822984e1951c21a3c18" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "FK_c4ec20a1cb494c9c3e34c8da105" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "FK_70eb26cea4105a27ce856dca20d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "FK_70eb26cea4105a27ce856dca20d"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "FK_c4ec20a1cb494c9c3e34c8da105"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_d285b373822984e1951c21a3c18"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_723792fc2012f8a4c47915d1e25"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70eb26cea4105a27ce856dca20"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c4ec20a1cb494c9c3e34c8da10"
        `);
        await queryRunner.query(`
            DROP TABLE "product_to_category"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
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
        await queryRunner.query(`
            DROP TABLE "order"
        `);
        await queryRunner.query(`
            DROP TABLE "order_item"
        `);
        await queryRunner.query(`
            DROP TABLE "product"
        `);
        await queryRunner.query(`
            DROP TABLE "category"
        `);
    }

}
