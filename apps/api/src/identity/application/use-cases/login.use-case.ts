import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PasswordService } from '../../domain/password.service';
import { UserRepositoryPort } from '../ports/user.repository.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await PasswordService.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
