import { MigrationInterface, QueryRunner } from "typeorm";

export class New1739962685179 implements MigrationInterface {
    name = 'New1739962685179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."water_meter_type_enum" AS ENUM('SONEB', 'FORAGE')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."paint_enum" AS ENUM('NO', 'YES_CLIENT', 'YES_OWNER')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sanitary_enum" AS ENUM('NO', 'YES', 'MIDDLE')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."electricity_meter_type_enum" AS ENUM('PERSONAL', 'DECOUNTER')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."electricity_personal_meter_type_enum" AS ENUM('PREPAID', 'POST_PREPAID')
        `);
        await queryRunner.query(`
            CREATE TABLE "property" (
                "id" SERIAL NOT NULL,
                "number_rooms" integer NOT NULL,
                "number_living_rooms" integer NOT NULL,
                "rent_price" integer NOT NULL,
                "is_prepaid" boolean NOT NULL,
                "month_advance" integer NOT NULL,
                "number_households" integer NOT NULL,
                "is_terace" boolean NOT NULL,
                "is_fence" boolean NOT NULL,
                "description" character varying NOT NULL,
                "visit_price" integer NOT NULL,
                "water_commission" integer NOT NULL,
                "water_drilling_rate" integer,
                "electricity_commission" integer NOT NULL,
                "electricity_decounter_meter_rate" integer,
                "is_active" boolean NOT NULL DEFAULT true,
                "latitude" numeric(10, 6) NOT NULL,
                "longitude" numeric(10, 6) NOT NULL,
                "userId" integer NOT NULL,
                "water_meter_type" "public"."water_meter_type_enum" NOT NULL,
                "paint" "public"."paint_enum" NOT NULL,
                "sanitary" "public"."sanitary_enum" NOT NULL,
                "electricity_meter_type" "public"."electricity_meter_type_enum" NOT NULL,
                "electricity_personal_meter_type" "public"."electricity_personal_meter_type_enum",
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "gallery" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "propertyId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_65d7a1ef91ddafb3e7071b188a0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            DROP TABLE "gallery"
        `);
        await queryRunner.query(`
            DROP TABLE "property"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."electricity_personal_meter_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."electricity_meter_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sanitary_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."paint_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."water_meter_type_enum"
        `);
    }

}
