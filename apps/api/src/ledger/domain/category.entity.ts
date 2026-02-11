import { randomUUID } from 'crypto';
import { CategoryType } from '../../shared';

export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: CategoryType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(userId: string, name: string, type: CategoryType): Category {
    const now = new Date();
    return new Category(
      randomUUID(),
      userId,
      name.trim(),
      type,
      now,
      now,
    );
  }
}
