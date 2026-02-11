import { Injectable, Inject } from '@nestjs/common';
import { Account } from '../../../domain/account.entity';
import { AccountRepositoryPort } from '../../ports/account.repository.port';

@Injectable()
export class GetAccountsUseCase {
  constructor(
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountRepository.findByUserId(userId);
  }
}
