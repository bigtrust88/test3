import { IsNumber, IsString, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPostsDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  category?: string; // slug 기반 필터링 (category_id가 없을 때 사용)

  @IsString()
  @IsOptional()
  tag_id?: string;

  @IsString()
  @IsOptional()
  tag?: string; // slug 기반 필터링 (tag_id가 없을 때 사용)

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_ai_generated?: boolean;

  @IsString()
  @IsOptional()
  sort: 'latest' | 'oldest' | 'popular' = 'latest'; // popular은 향후 구현 (조회수 기반)
}
