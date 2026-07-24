import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderMediaDto {
  @ApiProperty({
    type: [String],
    description: 'ListingMedia ids in the desired sort order (index 0 = primary)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds!: string[];
}
