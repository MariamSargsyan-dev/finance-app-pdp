import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  MonthlySummaryQueryDto,
  CashflowQueryDto,
} from '../../application/dtos/report.dto';
import { MonthlySummaryUseCase } from '../../application/use-cases/monthly-summary.use-case';
import { TopCategoriesUseCase } from '../../application/use-cases/top-categories.use-case';
import { DailyCashflowUseCase } from '../../application/use-cases/daily-cashflow.use-case';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly monthlySummaryUseCase: MonthlySummaryUseCase,
    private readonly topCategoriesUseCase: TopCategoriesUseCase,
    private readonly dailyCashflowUseCase: DailyCashflowUseCase,
  ) {}

  @Get('summary')
  async getSummary(
    @CurrentUser() user: any,
    @Query() query: MonthlySummaryQueryDto,
  ) {
    return this.monthlySummaryUseCase.execute(user.id, query.month);
  }

  @Get('top-categories')
  async getTopCategories(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('limit') limit?: string,
  ) {
    return this.topCategoriesUseCase.execute(
      user.id,
      month,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('cashflow')
  async getCashflow(
    @CurrentUser() user: any,
    @Query() query: CashflowQueryDto,
  ) {
    return this.dailyCashflowUseCase.execute(
      user.id,
      new Date(query.from),
      new Date(query.to),
    );
  }
}
