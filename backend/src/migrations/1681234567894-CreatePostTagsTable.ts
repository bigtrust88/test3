import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePostTagsTable1681234567894 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_tags',
        columns: [
          {
            name: 'post_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'tag_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'post_tags',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_tags',
      new TableForeignKey({
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('post_tags');
    const foreignKeys = table.foreignKeys;

    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('post_tags', fk);
    }

    await queryRunner.dropTable('post_tags');
  }
}
