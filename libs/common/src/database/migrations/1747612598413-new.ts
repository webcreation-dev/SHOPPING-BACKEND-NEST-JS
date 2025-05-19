import { MigrationInterface, QueryRunner } from "typeorm";

export class New1747612598413 implements MigrationInterface {
    name = 'New1747612598413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" SERIAL NOT NULL,
                "name" "public"."role_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
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
            CREATE TABLE "visit" (
                "id" SERIAL NOT NULL,
                "code" character varying NOT NULL,
                "date" TIMESTAMP,
                "is_taken" boolean NOT NULL DEFAULT false,
                "is_paid" boolean NOT NULL DEFAULT false,
                "status" "public"."status_visit_enum" NOT NULL DEFAULT 'WAITING',
                "userId" integer,
                "propertyId" integer,
                "managerId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_4d486e35b6c38e8f4f390f47922" UNIQUE ("code"),
                CONSTRAINT "PK_c9919ef5a07627657c535d8eb88" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "annuity" (
                "id" SERIAL NOT NULL,
                "amount" integer NOT NULL,
                "dueId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_6a5ea1125802532e936672d3624" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "due" (
                "id" SERIAL NOT NULL,
                "amount_paid" integer NOT NULL DEFAULT '0',
                "carry_over_amount" integer NOT NULL DEFAULT '0',
                "due_date" TIMESTAMP NOT NULL DEFAULT now(),
                "status_due" "public"."status_due_enum" NOT NULL DEFAULT 'WAITING',
                "invoices" json,
                "contractId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_6b83d79ba2c446d7ccce62bad2e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "contract" (
                "id" SERIAL NOT NULL,
                "start_date" TIMESTAMP NOT NULL,
                "end_date" TIMESTAMP,
                "rent_price" integer NOT NULL,
                "caution" integer NOT NULL,
                "articles" json,
                "status" "public"."status_contract_enum" NOT NULL DEFAULT 'PENDING',
                "propertyId" integer,
                "landlordId" integer,
                "tenantId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "panorama" (
                "id" SERIAL NOT NULL,
                "url" character varying NOT NULL,
                "propertyId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_c8945fecae5ee2b907e82ddc5bd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "property" (
                "id" SERIAL NOT NULL,
                "to_sell" boolean NOT NULL,
                "video_url" character varying,
                "tarification" "public"."tarification_enum",
                "type" "public"."type_property_enum" NOT NULL,
                "visit_price" integer NOT NULL,
                "rent_price" integer NOT NULL,
                "commission" integer NOT NULL,
                "management_fee" integer NOT NULL,
                "house_name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "latitude" numeric(10, 6),
                "longitude" numeric(10, 6),
                "district" character varying,
                "municipality" character varying,
                "department" character varying,
                "number_households" integer,
                "number_living_rooms" integer,
                "number_rooms" integer,
                "number_bathrooms" integer,
                "paint" "public"."paint_enum",
                "is_fence" boolean,
                "is_terace" boolean,
                "water_meter_type" "public"."water_meter_type_enum",
                "sanitary" "public"."sanitary_enum",
                "electricity_meter_type" "public"."electricity_meter_type_enum",
                "electricity_personal_meter_type" "public"."electricity_personal_meter_type_enum",
                "electricity_decounter_meter_rate" integer,
                "month_advance" integer,
                "caution" integer,
                "water_drilling_rate" integer,
                "is_prepaid" boolean,
                "is_active" boolean NOT NULL DEFAULT true,
                "articles" json NOT NULL DEFAULT '[]',
                "userId" integer,
                "ownerId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "lastname" character varying NOT NULL,
                "firstname" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "code" character varying NOT NULL,
                "password" character varying NOT NULL,
                "app_type" "public"."app_type_enum" NOT NULL DEFAULT 'LOCAPAY',
                "status" "public"."status_user_enum" NOT NULL DEFAULT 'NOT_VERIFIED',
                "fcm_token" character varying,
                "image" character varying,
                "card_image" character varying,
                "card_number" integer,
                "signature" character varying,
                "person_card" character varying,
                "reason" character varying,
                "sexe" "public"."sexe_enum" NOT NULL,
                "balance_mtn" character varying,
                "balance_moov" character varying,
                "wishlistedProperties" integer array NOT NULL DEFAULT '{}',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"),
                CONSTRAINT "UQ_c5f78ad8f82e492c25d07f047a5" UNIQUE ("code"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "content" character varying NOT NULL,
                "status" "public"."status_notification_enum" NOT NULL DEFAULT 'NOT_READ',
                "type" "public"."type_notification_enum" NOT NULL,
                "module_id" integer NOT NULL,
                "userId" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "waitlist" (
                "id" SERIAL NOT NULL,
                "lastname" character varying NOT NULL,
                "firstname" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "email" character varying NOT NULL,
                "business_sector" character varying NOT NULL,
                "category" character varying NOT NULL,
                "expectations" character varying NOT NULL,
                "used_infos" boolean NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_973cfbedc6381485681d6a6916c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_roles_role" (
                "userId" integer NOT NULL,
                "roleId" integer NOT NULL,
                CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId")
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery"
            ADD CONSTRAINT "FK_96c88a83bf3357b98162620293e" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit"
            ADD CONSTRAINT "FK_27531e380326b478dacdd7b86d9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit"
            ADD CONSTRAINT "FK_f3ea1f66b0a9c6ce8318b95a4b3" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "visit"
            ADD CONSTRAINT "FK_8a9fd2a4e430a2c72ace6c97726" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "annuity"
            ADD CONSTRAINT "FK_2b081fdd2d6f6ce70b471acba89" FOREIGN KEY ("dueId") REFERENCES "due"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "due"
            ADD CONSTRAINT "FK_ce799619f2776150d7b4a04f06b" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contract"
            ADD CONSTRAINT "FK_941cd11e8b67201836579929ced" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contract"
            ADD CONSTRAINT "FK_da50a75ac5554e975c7d932fb90" FOREIGN KEY ("landlordId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "contract"
            ADD CONSTRAINT "FK_55192eaad5af3ea323029bba042" FOREIGN KEY ("tenantId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "panorama"
            ADD CONSTRAINT "FK_5490cf649ee970c9abed0aa7d17" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_d90007b39cfcf412e15823bebc1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "property"
            ADD CONSTRAINT "FK_917755242ab5b0a0b08a63016d9" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "notification"
            ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles_role"
            ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles_role"
            ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"
        `);
        await queryRunner.query(`
            ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_917755242ab5b0a0b08a63016d9"
        `);
        await queryRunner.query(`
            ALTER TABLE "property" DROP CONSTRAINT "FK_d90007b39cfcf412e15823bebc1"
        `);
        await queryRunner.query(`
            ALTER TABLE "panorama" DROP CONSTRAINT "FK_5490cf649ee970c9abed0aa7d17"
        `);
        await queryRunner.query(`
            ALTER TABLE "contract" DROP CONSTRAINT "FK_55192eaad5af3ea323029bba042"
        `);
        await queryRunner.query(`
            ALTER TABLE "contract" DROP CONSTRAINT "FK_da50a75ac5554e975c7d932fb90"
        `);
        await queryRunner.query(`
            ALTER TABLE "contract" DROP CONSTRAINT "FK_941cd11e8b67201836579929ced"
        `);
        await queryRunner.query(`
            ALTER TABLE "due" DROP CONSTRAINT "FK_ce799619f2776150d7b4a04f06b"
        `);
        await queryRunner.query(`
            ALTER TABLE "annuity" DROP CONSTRAINT "FK_2b081fdd2d6f6ce70b471acba89"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit" DROP CONSTRAINT "FK_8a9fd2a4e430a2c72ace6c97726"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit" DROP CONSTRAINT "FK_f3ea1f66b0a9c6ce8318b95a4b3"
        `);
        await queryRunner.query(`
            ALTER TABLE "visit" DROP CONSTRAINT "FK_27531e380326b478dacdd7b86d9"
        `);
        await queryRunner.query(`
            ALTER TABLE "gallery" DROP CONSTRAINT "FK_96c88a83bf3357b98162620293e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4be2f7adf862634f5f803d246b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5f9286e6c25594c6b88c108db7"
        `);
        await queryRunner.query(`
            DROP TABLE "user_roles_role"
        `);
        await queryRunner.query(`
            DROP TABLE "waitlist"
        `);
        await queryRunner.query(`
            DROP TABLE "notification"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "property"
        `);
        await queryRunner.query(`
            DROP TABLE "panorama"
        `);
        await queryRunner.query(`
            DROP TABLE "contract"
        `);
        await queryRunner.query(`
            DROP TABLE "due"
        `);
        await queryRunner.query(`
            DROP TABLE "annuity"
        `);
        await queryRunner.query(`
            DROP TABLE "visit"
        `);
        await queryRunner.query(`
            DROP TABLE "gallery"
        `);
        await queryRunner.query(`
            DROP TABLE "role"
        `);
    }

}
