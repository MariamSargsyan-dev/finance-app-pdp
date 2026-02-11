import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction as DomainTransaction } from '../domain/transaction.entity';
import { TransactionType } from '../../shared';
import { UserEntity } from '../../identity/infrastructure/user.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'enum', enum: ['income', 'expense', 'transfer'] })
  type: TransactionType;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'uuid', nullable: true })
  toAccountId: string | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: TransactionEntity): DomainTransaction {
    return new DomainTransaction(
      entity.id,
      entity.userId,
      entity.type as TransactionType,
      entity.accountId,
      entity.toAccountId,
      entity.categoryId,
      parseFloat(entity.amount.toString()),
      entity.date,
      entity.note,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: DomainTransaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
      entity.type = domain.type;
    entity.accountId = domain.accountId;
    entity.toAccountId = domain.toAccountId;
    entity.categoryId = domain.categoryId;
    entity.amount = domain.amount;
    entity.date = domain.date;
    entity.note = domain.note;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
