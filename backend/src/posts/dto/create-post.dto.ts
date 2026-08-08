import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ValidateIf,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class YoutubeOverrideDto {
  @IsOptional()
  @IsBoolean()
  isShort?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  privacyStatus?: string;

  @IsOptional()
  @IsBoolean()
  madeForKids?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  title?: string;
}

/** Body shape matching old Express POST /api/post */
export class CreatePostDto {
  /** Single account (legacy web UI shape) */
  @ValidateIf((o: CreatePostDto) => !o.accounts?.length)
  @IsString()
  @IsNotEmpty()
  accountId?: string;

  /** Multiple accounts (CLI / multi-post shape) */
  @ValidateIf((o: CreatePostDto) => !o.accountId)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  accounts?: string[];

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsArray()
  media?: Array<{ url: string; filename?: string }>;

  /** YouTube-specific overrides (top-level Outstand key) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => YoutubeOverrideDto)
  youtube?: YoutubeOverrideDto;
}
