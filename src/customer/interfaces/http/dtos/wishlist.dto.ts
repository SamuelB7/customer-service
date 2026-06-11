import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({ example: 'listing_123' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  listingId: string;

  @ApiPropertyOptional({ example: 'seller_123' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sellerId?: string;

  @ApiPropertyOptional({ example: 'Gift idea' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

