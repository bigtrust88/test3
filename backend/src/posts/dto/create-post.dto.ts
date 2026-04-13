import { IsString, IsNotEmpty, MinLength, MaxLength, IsArray, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  content_md: string;

  @IsString()
  @IsNotEmpty()
  content_html: string;

  @IsNumber()
  @IsOptional()
  reading_time_mins: number = 0;

  @IsString()
  @IsOptional()
  cover_image_url?: string;

  @IsString()
  @IsNotEmpty()
  category_id: string;

  @IsArray()
  @IsOptional()
  tag_ids?: string[];

  @IsArray()
  @IsOptional()
  ai_source_urls?: string[];

  @IsBoolean()
  @IsOptional()
  is_ai_generated: boolean = false;

  @IsBoolean()
  @IsOptional()
  is_published: boolean = false;
}
