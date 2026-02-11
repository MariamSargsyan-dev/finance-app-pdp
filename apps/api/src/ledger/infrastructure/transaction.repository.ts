import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Transaction } from '../domain/transaction.entity';
import {
  TransactionRepositoryPort,
  TransactionFilter,
} from '../application/ports/transaction.repository.port';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class TransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const entity = TransactionEntity.fromDomain(transaction);
    const saved = await this.repository.save(entity);
    return TransactionEntity.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TransactionEntity.toDomain(entity) : null;
  }

  async findByUserId(
    userId: string,
    filter?: TransactionFilter,
  ): Promise<Transaction[]> {
    const where: FindOptionsWhere<TransactionEntity> = { userId };

    if (filter?.type) {
      where.type = filter.type as any;
    }
    if (filter?.accountId) {
      where.accountId = filter.accountId;
    }
    if (filter?.categoryId) {
      where.categoryId = filter.categoryId;
    }
    if (filter?.fromDate || filter?.toDate) {
      where.date = {} as any;
      if (filter.fromDate) {
        where.date = { $gte: filter.fromDate } as any;
      }
      if (filter.toDate) {
        where.date = { ...where.date, $lte: filter.toDate } as any;
      }
    }

    const queryBuilder = this.repository.createQueryBuilder('transaction');
    queryBuilder.where('transaction.userId = :userId', { userId });

    if (filter?.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filter.type });
    }
    if (filter?.accountId) {
      queryBuilder.andWhere('transaction.accountId = :accountId', {
        accountId: filter.accountId,
      });
    }
    if (filter?.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', {
        categoryId: filter.categoryId,
      });
    }
    if (filter?.fromDate) {
      queryBuilder.andWhere('transaction.date >= :fromDate', {
        fromDate: filter.fromDate,
      });
    }
    if (filter?.toDate) {
      queryBuilder.andWhere('transaction.date <= :toDate', {
        toDate: filter.toDate,
      });
    }

    queryBuilder.orderBy('transaction.date', 'DESC');
    queryBuilder.addOrderBy('transaction.createdAt', 'DESC');

    const entities = await queryBuilder.getMany();
    return entities.map(TransactionEntity.toDomain);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const entity = TransactionEntity.fromDomain(transaction);
    const saved = await this.repository.save(entity);
    return TransactionEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
