import { IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { CategoryType } from '../../../shared';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsEnum(CategoryType)
  type: CategoryType;
}

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
