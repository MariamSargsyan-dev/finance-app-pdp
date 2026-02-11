import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../domain/account.entity';
import { AccountRepositoryPort } from '../application/ports/account.repository.port';
import { AccountEntity } from './account.entity';

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  async save(account: Account): Promise<Account> {
    const entity = AccountEntity.fromDomain(account);
    const saved = await this.repository.save(entity);
    return AccountEntity.toDomain(saved);
  }

  async findById(id: string): Promise<Account | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AccountEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(AccountEntity.toDomain);
  }

  async findOneByOwnerAndName(userId: string, name: string): Promise<Account | null> {
    const entity = await this.repository.findOne({
      where: { userId, name },
    });
    return entity ? AccountEntity.toDomain(entity) : null;
  }

  async update(account: Account): Promise<Account> {
    const entity = AccountEntity.fromDomain(account);
    const saved = await this.repository.save(entity);
    return AccountEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
