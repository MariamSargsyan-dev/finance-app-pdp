import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterDto,
} from '../../application/dtos/transaction.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/transactions/create-transaction.use-case';
import { GetTransactionsUseCase } from '../../application/use-cases/transactions/get-transactions.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/transactions/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/transactions/delete-transaction.use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    const transaction = await this.createTransactionUseCase.execute(
      user.id,
      dto.type,
      dto.accountId,
      dto.toAccountId,
      dto.categoryId,
      dto.amount,
      new Date(dto.date),
      dto.note || null,
    );
    return {
      id: transaction.id,
      type: transaction.type,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() filter: TransactionFilterDto,
  ) {
    const transactions = await this.getTransactionsUseCase.execute(user.id, {
      fromDate: filter.fromDate ? new Date(filter.fromDate) : undefined,
      toDate: filter.toDate ? new Date(filter.toDate) : undefined,
      type: filter.type,
      accountId: filter.accountId,
      categoryId: filter.categoryId,
    });
    return transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    await this.updateTransactionUseCase.execute(
      user.id,
      id,
      dto.amount,
      dto.date ? new Date(dto.date) : undefined,
      dto.note,
    );
    return { message: 'Transaction updated successfully' };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.deleteTransactionUseCase.execute(user.id, id);
    return { message: 'Transaction deleted successfully' };
  }
}
