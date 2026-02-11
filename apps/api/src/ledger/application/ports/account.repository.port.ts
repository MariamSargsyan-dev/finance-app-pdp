import { Account } from '../../domain/account.entity';

export interface AccountRepositoryPort {
  save(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findOneByOwnerAndName(userId: string, name: string): Promise<Account | null>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}
