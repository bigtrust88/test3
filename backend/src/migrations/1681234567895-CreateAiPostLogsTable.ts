import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateAiPostLogsTable1681234567895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_post_logs',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'post_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'n8n_execution_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'trigger_time',
            type: 'timestamp',
          },
          {
            name: 'trigger_type',
            type: 'enum',
            enum: ['morning', 'afternoon', 'evening'],
          },
          {
            name: 'crawled_urls',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'claude_prompt_tokens',
            type: 'int',
          },
          {
            name: 'claude_completion_tokens',
            type: 'int',
          },
          {
            name: 'claude_model',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'success', 'failed'],
            default: "'pending'",
          },
          {
            name: 'is_success',
            type: 'boolean',
            default: false,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'thumbnail_generated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'thumbnail_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'bannerbear_uid',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'thumbnail_sentiment',
            type: 'enum',
            enum: ['bullish', 'bearish', 'neutral'],
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            columnNames: ['status'],
          },
          {
            columnNames: ['is_success'],
          },
          {
            columnNames: ['n8n_execution_id'],
            isUnique: true,
          },
          {
            columnNames: ['created_at'],
          },
          {
            columnNames: ['thumbnail_generated'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'ai_post_logs',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ai_post_logs');
    const foreignKeys = table.foreignKeys;

    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('ai_post_logs', fk);
    }

    await queryRunner.dropTable('ai_post_logs');
  }
}
