import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { toOptionalBoolean } from 'src/common/utils/transformers';

export class ListCategoriesQueryDto {
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}
