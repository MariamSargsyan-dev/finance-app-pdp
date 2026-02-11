import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../domain/category.entity';
import { CategoryRepositoryPort } from '../application/ports/category.repository.port';
import { CategoryEntity } from './category.entity';

@Injectable()
export class CategoryRepository implements CategoryRepositoryPort {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async save(category: Category): Promise<Category> {
    const entity = CategoryEntity.fromDomain(category);
    const saved = await this.repository.save(entity);
    return CategoryEntity.toDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CategoryEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(CategoryEntity.toDomain);
  }

  async findOneByOwnerTypeAndName(
    userId: string,
    type: string,
    name: string,
  ): Promise<Category | null> {
    const entity = await this.repository.findOne({
      where: { userId, type: type as any, name },
    });
    return entity ? CategoryEntity.toDomain(entity) : null;
  }

  async update(category: Category): Promise<Category> {
    const entity = CategoryEntity.fromDomain(category);
    const saved = await this.repository.save(entity);
    return CategoryEntity.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
