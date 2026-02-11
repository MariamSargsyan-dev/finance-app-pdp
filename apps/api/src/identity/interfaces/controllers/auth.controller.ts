import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { AuthJwtService } from '../services/jwt.service';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRepositoryPort } from '../../application/ports/user.repository.port';
import { AccountRepositoryPort } from '../../../ledger/application/ports/account.repository.port';
import { CategoryRepositoryPort } from '../../../ledger/application/ports/category.repository.port';
import { TransactionRepositoryPort } from '../../../ledger/application/ports/transaction.repository.port';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: AuthJwtService,
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
    @Inject('AccountRepositoryPort')
    private readonly accountRepository: AccountRepositoryPort,
    @Inject('CategoryRepositoryPort')
    private readonly categoryRepository: CategoryRepositoryPort,
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.registerUseCase.execute(dto.email, dto.password);
    const tokens = this.jwtService.generateTokens(user.id, user.email);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @CurrentUser() user: any): Promise<AuthResponseDto> {
    const tokens = this.jwtService.generateTokens(user.id, user.email);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const tokens = this.jwtService.generateTokens(payload.sub, payload.email);
    return {
      ...tokens,
      user: {
        id: payload.sub,
        email: payload.email,
      },
    };
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const fullUser = await this.userRepository.findById(user.id);
    const [accounts, categories, transactions] = await Promise.all([
      this.accountRepository.findByUserId(user.id),
      this.categoryRepository.findByUserId(user.id),
      this.transactionRepository.findByUserId(user.id),
    ]);
    return {
      id: user.id,
      email: user.email,
      onboardingCompleted: fullUser?.onboardingCompleted ?? false,
      accountsCount: accounts.length,
      categoriesCount: categories.length,
      transactionsCount: transactions.length,
    };
  }
}
