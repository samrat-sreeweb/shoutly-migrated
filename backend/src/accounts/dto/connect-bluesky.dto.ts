import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectBlueskyDto {
  @IsString()
  @IsNotEmpty()
  handle!: string;

  @IsString()
  @IsNotEmpty()
  appPassword!: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
