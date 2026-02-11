import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../application/ports/user.repository.port';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = UserEntity.fromDomain(user);
    const saved = await this.repository.save(entity);
    return UserEntity.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    return entity ? UserEntity.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? UserEntity.toDomain(entity) : null;
  }

  async setOnboardingCompleted(userId: string): Promise<void> {
    await this.repository.update(userId, { onboardingCompleted: true });
  }
}
