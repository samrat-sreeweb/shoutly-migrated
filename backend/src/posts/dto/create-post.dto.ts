import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';

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
}
