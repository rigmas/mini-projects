import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsPublishedOnShiftTable1658576419530 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE shift ADD COLUMN "isPublished" BOOLEAN DEFAULT FALSE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
