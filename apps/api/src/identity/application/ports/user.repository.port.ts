import { User } from '../../domain/user.entity';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  setOnboardingCompleted(userId: string): Promise<void>;
}
