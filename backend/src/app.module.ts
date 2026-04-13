import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { AiLogsModule } from './ai-logs/ai-logs.module';
import { ThumbnailModule } from './thumbnails/thumbnail.module';

@Module({
  imports: [
    // Environment Variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    // Database Configuration
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'stock_blog',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: false, // Use migrations instead
      logging: process.env.NODE_ENV === 'development',
      migrationsRun: false,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Auth Module
    AuthModule,

    // Posts Module
    PostsModule,

    // AI Logs Module
    AiLogsModule,

    // Thumbnail Module
    ThumbnailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
