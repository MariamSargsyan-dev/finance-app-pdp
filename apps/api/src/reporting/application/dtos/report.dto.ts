import { IsString, IsDateString, Matches } from 'class-validator';

export class MonthlySummaryQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month: string;
}

export class CashflowQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
