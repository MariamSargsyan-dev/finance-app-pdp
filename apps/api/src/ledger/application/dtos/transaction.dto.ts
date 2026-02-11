import {
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionType } from '../../../shared';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID()
  accountId: string;

  @IsUUID()
  @IsOptional()
  toAccountId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateTransactionDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class TransactionFilterDto {
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
