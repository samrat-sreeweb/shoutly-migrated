import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ConfigureNetworkDto {
  @IsString()
  @IsNotEmpty()
  network!: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  secret?: string;
}
