import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, IsUrl } from 'class-validator';

export class CreateAiLogDto {
  @IsString()
  @IsNotEmpty()
  n8n_execution_id: string;

  @IsEnum(['morning', 'afternoon', 'evening'])
  @IsNotEmpty()
  trigger_type: 'morning' | 'afternoon' | 'evening';

  @IsArray()
  @IsOptional()
  crawled_urls?: string[];

  @IsNumber()
  @IsNotEmpty()
  claude_prompt_tokens: number;

  @IsNumber()
  @IsNotEmpty()
  claude_completion_tokens: number;

  @IsString()
  @IsNotEmpty()
  claude_model: string;

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
