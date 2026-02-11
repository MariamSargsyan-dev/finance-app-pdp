import { IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { AccountType } from '../../../shared';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  currency: string;
}

export class UpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;
}
