import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../infrastructure/user.entity';
import { UserRepository } from '../infrastructure/user.repository';
import { LedgerModule } from '../../ledger/interfaces/ledger.module';
import { AuthController } from './controllers/auth.controller';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthJwtService } from './services/jwt.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    LedgerModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    {
      provide: 'UserRepositoryPort',
      useExisting: UserRepository,
    },
    RegisterUseCase,
    LoginUseCase,
    LocalStrategy,
    JwtStrategy,
    AuthJwtService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [UserRepository, 'UserRepositoryPort'],
})
export class IdentityModule {}
