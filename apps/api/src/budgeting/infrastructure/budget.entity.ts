import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Budget as DomainBudget } from '../domain/budget.entity';
import { UserEntity } from '../../identity/infrastructure/user.entity';

@Entity('budgets')
@Unique(['userId', 'month', 'categoryId'])
export class BudgetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  month: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: BudgetEntity): DomainBudget {
    return new DomainBudget(
      entity.id,
      entity.userId,
      entity.month,
      entity.categoryId,
      parseFloat(entity.amount.toString()),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: DomainBudget): BudgetEntity {
    const entity = new BudgetEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.month = domain.month;
    entity.categoryId = domain.categoryId;
    entity.amount = domain.amount;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
