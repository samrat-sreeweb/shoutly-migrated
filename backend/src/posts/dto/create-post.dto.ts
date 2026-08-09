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
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function encodeMediaUrl({ value }: { value: unknown }) {
  if (typeof value !== 'string') return value;
  try {
    return encodeURI(decodeURI(value));
  } catch {
    return encodeURI(value);
  }
}

export class MediaItemDto {
  /** Allow spaces in stored Outstand URLs; we normalize to %20 before validate. */
  @Transform(encodeMediaUrl)
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/\S+/i, {
    message: 'media.url must be a valid http(s) URL',
  })
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

export class GoogleBusinessCallToActionDto {
  @IsString()
  @IsNotEmpty()
  actionType!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;
}

export class GoogleBusinessDateDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  day?: number;
}

export class GoogleBusinessTimeDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  hours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  minutes?: number;
}

export class GoogleBusinessEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessDateDto)
  startDate?: GoogleBusinessDateDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessTimeDto)
  startTime?: GoogleBusinessTimeDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessDateDto)
  endDate?: GoogleBusinessDateDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessTimeDto)
  endTime?: GoogleBusinessTimeDto;
}

export class GoogleBusinessOfferDto {
  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redeemOnlineUrl?: string;

  @IsOptional()
  @IsString()
  termsConditions?: string;
}

export class GoogleBusinessOverrideDto {
  @IsOptional()
  @IsString()
  topicType?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessCallToActionDto)
  callToAction?: GoogleBusinessCallToActionDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessEventDto)
  event?: GoogleBusinessEventDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessOfferDto)
  offer?: GoogleBusinessOfferDto;
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

  /** Google Business Profile overrides (top-level Outstand key) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GoogleBusinessOverrideDto)
  google_business?: GoogleBusinessOverrideDto;
}
