import { IsString, MinLength } from 'class-validator';

export class FindProductBySlugParamsDto {
  @IsString()
  @MinLength(1)
  slug!: string;
}
