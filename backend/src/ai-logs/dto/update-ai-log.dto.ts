import { IsString, IsOptional, IsEnum, IsBoolean, IsUrl } from 'class-validator';

export class UpdateAiLogDto {
  @IsString()
  @IsOptional()
  post_id?: string;

  @IsEnum(['pending', 'success', 'failed'])
  @IsOptional()
  status?: 'pending' | 'success' | 'failed';

  @IsBoolean()
  @IsOptional()
  is_success?: boolean;

  @IsString()
  @IsOptional()
  error_message?: string;

  @IsBoolean()
  @IsOptional()
  thumbnail_generated?: boolean;

  @IsUrl()
  @IsOptional()
  thumbnail_url?: string;

  @IsString()
  @IsOptional()
  bannerbear_uid?: string;

  @IsEnum(['bullish', 'bearish', 'neutral'])
  @IsOptional()
  thumbnail_sentiment?: 'bullish' | 'bearish' | 'neutral';
}
