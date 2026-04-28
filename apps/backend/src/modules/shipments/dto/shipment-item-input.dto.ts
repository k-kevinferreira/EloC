import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class ShipmentItemInputDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost?: number;
}
