import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class ProductImageInputDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl(
    {
      require_tld: false,
    },
    {
      message: 'image url must be a valid URL.',
    },
  )
  url!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(255)
  altText?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
