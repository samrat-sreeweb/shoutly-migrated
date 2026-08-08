import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class FinalizePendingDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  selectedPageIds!: string[];
}
