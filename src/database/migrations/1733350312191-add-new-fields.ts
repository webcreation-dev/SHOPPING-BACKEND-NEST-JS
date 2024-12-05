import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFields1733350312191 implements MigrationInterface {
    name = 'AddNewFields1733350312191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_d09d285fe1645cd2f0db811e293"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "REL_d09d285fe1645cd2f0db811e29"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD "orderId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "UQ_d09d285fe1645cd2f0db811e293" UNIQUE ("orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "FK_70eb26cea4105a27ce856dca20d"
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "FK_c4ec20a1cb494c9c3e34c8da105"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_904370c093ceea4369659a3c810" PRIMARY KEY ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD "orderId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_904370c093ceea4369659a3c810"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a" PRIMARY KEY ("productId", "orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_646bf9ece6f45dbe41c203e06e0" PRIMARY KEY ("orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP COLUMN "productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD "productId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_646bf9ece6f45dbe41c203e06e0"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a" PRIMARY KEY ("orderId", "productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "PK_1031171c13130102495201e3e20"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP COLUMN "propertyId"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD "propertyId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_d285b373822984e1951c21a3c18"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "PK_d80743e6191258a5003d5843b4f"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "REL_d285b373822984e1951c21a3c1"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "locationId"
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "locationId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "UQ_d285b373822984e1951c21a3c18" UNIQUE ("locationId")
        `);
        await queryRunner.query(`
            ALTER TABLE "location" DROP CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827"
        `);
        await queryRunner.query(`
            ALTER TABLE "location" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "location"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "location"
            ADD CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_ead833542a5bf513c93bc12b016"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_70eb26cea4105a27ce856dca20d" PRIMARY KEY ("categoryId")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c4ec20a1cb494c9c3e34c8da10"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP COLUMN "productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD "productId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_70eb26cea4105a27ce856dca20d"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_ead833542a5bf513c93bc12b016" PRIMARY KEY ("categoryId", "productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_ead833542a5bf513c93bc12b016"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_c4ec20a1cb494c9c3e34c8da105" PRIMARY KEY ("productId")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70eb26cea4105a27ce856dca20"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP COLUMN "categoryId"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD "categoryId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_c4ec20a1cb494c9c3e34c8da105"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_ead833542a5bf513c93bc12b016" PRIMARY KEY ("productId", "categoryId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c4ec20a1cb494c9c3e34c8da10" ON "product_to_category" ("productId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70eb26cea4105a27ce856dca20" ON "product_to_category" ("categoryId")
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_d09d285fe1645cd2f0db811e293" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_d09d285fe1645cd2f0db811e293"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70eb26cea4105a27ce856dca20"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c4ec20a1cb494c9c3e34c8da10"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_ead833542a5bf513c93bc12b016"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_c4ec20a1cb494c9c3e34c8da105" PRIMARY KEY ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP COLUMN "categoryId"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD "categoryId" uuid NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70eb26cea4105a27ce856dca20" ON "product_to_category" ("categoryId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_c4ec20a1cb494c9c3e34c8da105"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_ead833542a5bf513c93bc12b016" PRIMARY KEY ("categoryId", "productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_ead833542a5bf513c93bc12b016"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_70eb26cea4105a27ce856dca20d" PRIMARY KEY ("categoryId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP COLUMN "productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD "productId" uuid NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c4ec20a1cb494c9c3e34c8da10" ON "product_to_category" ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category" DROP CONSTRAINT "PK_70eb26cea4105a27ce856dca20d"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "PK_ead833542a5bf513c93bc12b016" PRIMARY KEY ("productId", "categoryId")
        `);
        await queryRunner.query(`
            ALTER TABLE "location" DROP CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827"
        `);
        await queryRunner.query(`
            ALTER TABLE "location" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "location"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "location"
            ADD CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "UQ_d285b373822984e1951c21a3c18"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "locationId"
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "locationId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "REL_d285b373822984e1951c21a3c1" UNIQUE ("locationId")
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "PK_d80743e6191258a5003d5843b4f"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_d285b373822984e1951c21a3c18" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP COLUMN "propertyId"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD "propertyId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP CONSTRAINT "PK_1031171c13130102495201e3e20"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_646bf9ece6f45dbe41c203e06e0" PRIMARY KEY ("orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP COLUMN "productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD "productId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_646bf9ece6f45dbe41c203e06e0"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a" PRIMARY KEY ("productId", "orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_904370c093ceea4369659a3c810" PRIMARY KEY ("productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD "orderId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item" DROP CONSTRAINT "PK_904370c093ceea4369659a3c810"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "PK_7e383dc486afc7800bf87d1c11a" PRIMARY KEY ("orderId", "productId")
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "PK_bebc9158e480b949565b4dc7a82"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "product"
            ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "FK_c4ec20a1cb494c9c3e34c8da105" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_item"
            ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03"
        `);
        await queryRunner.query(`
            ALTER TABLE "category" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "category"
            ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "product_to_category"
            ADD CONSTRAINT "FK_70eb26cea4105a27ce856dca20d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "UQ_d09d285fe1645cd2f0db811e293"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD "orderId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "REL_d09d285fe1645cd2f0db811e29" UNIQUE ("orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_d09d285fe1645cd2f0db811e293" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
