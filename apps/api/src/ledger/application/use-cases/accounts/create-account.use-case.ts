import { Injectable, Inject } from '@nestjs/common';
import { Account } from '../../../domain/account.entity';
import { AccountRepositoryPort } from '../../ports/account.repository.port';
import { AccountType } from '../../../../shared';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(
    userId: string,
    name: string,
    type: AccountType,
    currency: string,
  ): Promise<Account> {
    const account = Account.create(userId, name, type, currency);
    return this.accountRepository.save(account);
  }
}
