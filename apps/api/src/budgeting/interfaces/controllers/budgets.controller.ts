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
import { CreateBudgetDto, UpdateBudgetDto } from '../../application/dtos/budget.dto';
import { CreateBudgetUseCase } from '../../application/use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../../application/use-cases/get-budgets.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/delete-budget.use-case';

@Controller('budgets')
export class BudgetsController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    const budget = await this.createBudgetUseCase.execute(
      user.id,
      dto.month,
      dto.categoryId,
      dto.amount,
    );
    return {
      id: budget.id,
      month: budget.month,
      categoryId: budget.categoryId,
      amount: budget.amount,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: any, @Query('month') month?: string) {
    const budgets = await this.getBudgetsUseCase.execute(user.id, month);
    return budgets.map((budget) => ({
      id: budget.id,
      month: budget.month,
      categoryId: budget.categoryId,
      amount: budget.amount,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    }));
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    await this.updateBudgetUseCase.execute(user.id, id, dto.amount);
    return { message: 'Budget updated successfully' };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.deleteBudgetUseCase.execute(user.id, id);
    return { message: 'Budget deleted successfully' };
  }
}
