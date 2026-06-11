import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class FollowSellerDto {
  @ApiProperty({ example: 'seller_123' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  sellerId: string;
}

