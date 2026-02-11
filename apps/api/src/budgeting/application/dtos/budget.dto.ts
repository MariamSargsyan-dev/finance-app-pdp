import {
  IsString,
  IsNumber,
  IsUUID,
  Min,
  Matches,
} from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class UpdateBudgetDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
