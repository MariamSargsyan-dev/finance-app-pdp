import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category as DomainCategory } from '../domain/category.entity';
import { CategoryType } from '../../shared';
import { UserEntity } from '../../identity/infrastructure/user.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: CategoryType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: CategoryEntity): DomainCategory {
    return new DomainCategory(
      entity.id,
      entity.userId,
      entity.name,
      entity.type as CategoryType,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: DomainCategory): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
      entity.type = domain.type;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
