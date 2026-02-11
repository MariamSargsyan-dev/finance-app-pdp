import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateAccountDto, UpdateAccountDto } from '../../application/dtos/account.dto';
import { CreateAccountUseCase } from '../../application/use-cases/accounts/create-account.use-case';
import { GetAccountsUseCase } from '../../application/use-cases/accounts/get-accounts.use-case';
import { UpdateAccountUseCase } from '../../application/use-cases/accounts/update-account.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/accounts/delete-account.use-case';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateAccountDto) {
    const account = await this.createAccountUseCase.execute(
      user.id,
      dto.name,
      dto.type,
      dto.currency,
    );
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    const accounts = await this.getAccountsUseCase.execute(user.id);
    return accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    await this.updateAccountUseCase.execute(user.id, id, dto.name);
    return { message: 'Account updated successfully' };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.deleteAccountUseCase.execute(user.id, id);
    return { message: 'Account deleted successfully' };
  }
}
