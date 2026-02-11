import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { PasswordService } from '../../domain/password.service';
import { UserRepositoryPort } from '../ports/user.repository.port';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await PasswordService.hash(password);
    const user = User.create(email, passwordHash);
    return this.userRepository.save(user);
  }
}
