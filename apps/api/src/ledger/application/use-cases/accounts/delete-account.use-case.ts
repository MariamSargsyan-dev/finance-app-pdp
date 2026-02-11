import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { AccountRepositoryPort } from '../../ports/account.repository.port';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(userId: string, accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.accountRepository.delete(accountId);
  }
}
