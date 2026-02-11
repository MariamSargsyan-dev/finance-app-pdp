import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User as DomainUser } from '../domain/user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: UserEntity): DomainUser {
    return new DomainUser(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.onboardingCompleted ?? false,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.passwordHash = domain.passwordHash;
    entity.onboardingCompleted = domain.onboardingCompleted;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
