import { CategoryType } from '../../../shared';
import { Category } from '../../domain/category.entity';

export interface CategoryRepositoryPort {
  save(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findOneByOwnerTypeAndName(userId: string, type: CategoryType, name: string): Promise<Category | null>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
