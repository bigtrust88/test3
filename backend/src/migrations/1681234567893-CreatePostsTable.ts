import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePostsTable1681234567893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'excerpt',
            type: 'text',
          },
          {
            name: 'content_md',
            type: 'longtext',
          },
          {
            name: 'content_html',
            type: 'longtext',
          },
          {
            name: 'reading_time_mins',
            type: 'int',
            default: 0,
          },
          {
            name: 'cover_image_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_published',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_ai_generated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ai_source_urls',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'char',
            length: '36',
          },
          {
            name: 'author_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            columnNames: ['slug'],
            isUnique: true,
          },
          {
            columnNames: ['published_at', 'is_published'],
          },
          {
            columnNames: ['is_ai_generated'],
          },
          {
            columnNames: ['category_id'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('posts');
    const foreignKeys = table.foreignKeys;

    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('posts', fk);
    }

    await queryRunner.dropTable('posts');
  }
}
