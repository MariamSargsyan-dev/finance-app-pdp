import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { AccountRepositoryPort } from '../../ports/account.repository.port';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(
    userId: string,
    accountId: string,
    name: string,
  ): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updated = new (account.constructor as any)(
      account.id,
      account.userId,
      name,
      account.type,
      account.currency,
      account.balance,
      account.createdAt,
      new Date(),
    );
    await this.accountRepository.update(updated);
  }
}
