import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePinterestBoardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  privacy?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
