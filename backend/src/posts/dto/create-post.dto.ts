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
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MediaItemDto {
  @IsUrl({ require_tld: false }, { message: 'media.url must be a valid URL' })
  url!: string;

  @IsOptional()
  @IsString()
  filename?: string;
}

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

export class PinterestOverrideDto {
  @IsString()
  @IsNotEmpty()
  board_id!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cover_image_url?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  link?: string;

  @IsOptional()
  @IsString()
  alt_text?: string;

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
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[];

  /** YouTube-specific overrides (top-level Outstand key) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => YoutubeOverrideDto)
  youtube?: YoutubeOverrideDto;

  /** Pinterest-specific overrides (top-level Outstand key; board_id required) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PinterestOverrideDto)
  pinterest?: PinterestOverrideDto;
}
