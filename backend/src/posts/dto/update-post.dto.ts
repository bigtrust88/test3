import { IsString, IsOptional, MinLength, MaxLength, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  excerpt?: string;

  @IsString()
  @IsOptional()
  content_md?: string;

  @IsString()
  @IsOptional()
  content_html?: string;

  @IsNumber()
  @IsOptional()
  reading_time_mins?: number;

  @IsString()
  @IsOptional()
  cover_image_url?: string;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  category_slug?: string;

  @IsArray()
  @IsOptional()
  tag_ids?: string[];

  @IsArray()
  @IsOptional()
  tag_names?: string[];

  @IsArray()
  @IsOptional()
  ai_source_urls?: string[];

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
