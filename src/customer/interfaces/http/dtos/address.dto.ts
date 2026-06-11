import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  recipientName: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  country: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  state: string;

  @ApiProperty({ example: 'Sao Paulo' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @ApiProperty({ example: 'Avenida Paulista' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  street: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  number: string;

  @ApiPropertyOptional({ example: 'Apt 42' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  complement?: string;

  @ApiProperty({ example: '01310-100' })
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  postalCode: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  recipientName?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'BR' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  country?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  state?: string;

  @ApiPropertyOptional({ example: 'Sao Paulo' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Avenida Paulista' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  street?: string;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  number?: string;

  @ApiPropertyOptional({ example: 'Apt 42' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  complement?: string;

  @ApiPropertyOptional({ example: '01310-100' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  postalCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

