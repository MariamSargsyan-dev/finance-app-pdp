import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../domain/budget.entity';
import { BudgetRepositoryPort } from '../application/ports/budget.repository.port';
import { BudgetEntity } from './budget.entity';

@Injectable()
export class BudgetRepository implements BudgetRepositoryPort {
  constructor(
    @InjectRepository(BudgetEntity)
    private readonly repository: Repository<BudgetEntity>,
  ) {}

  async save(budget: Budget): Promise<Budget> {
    const entity = BudgetEntity.fromDomain(budget);
    const saved = await this.repository.save(entity);
    return BudgetEntity.toDomain(saved);
  }

  async findById(id: string): Promise<Budget | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? BudgetEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string, month?: string): Promise<Budget[]> {
    const where: any = { userId };
    if (month) {
      where.month = month;
    }
    const entities = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return entities.map(BudgetEntity.toDomain);
  }

  async findByMonthAndCategory(
    userId: string,
    month: string,
    categoryId: string,
  ): Promise<Budget | null> {
    const entity = await this.repository.findOne({
      where: { userId, month, categoryId },
    });
    return entity ? BudgetEntity.toDomain(entity) : null;
  }

  async update(budget: Budget): Promise<Budget> {
    const entity = BudgetEntity.fromDomain(budget);
    const saved = await this.repository.save(entity);
    return BudgetEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
