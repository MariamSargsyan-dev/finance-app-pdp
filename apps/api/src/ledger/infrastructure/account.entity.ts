import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account as DomainAccount } from '../domain/account.entity';
import { AccountType } from '../../shared';
import { UserEntity } from '../../identity/infrastructure/user.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['cash', 'bank', 'card'] })
  type: AccountType;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: AccountEntity): DomainAccount {
    return new DomainAccount(
      entity.id,
      entity.userId,
      entity.name,
      entity.type as AccountType,
      entity.currency,
      parseFloat(entity.balance.toString()),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: DomainAccount): AccountEntity {
    const entity = new AccountEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
      entity.type = domain.type;
    entity.currency = domain.currency;
    entity.balance = domain.balance;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
