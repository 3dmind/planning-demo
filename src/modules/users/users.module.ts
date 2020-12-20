import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiConfigModule } from '../../api-config/api-config.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisCacheModule } from '../../redis-cache/redis-cache.module';
import { AuthService } from './auth.service';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { GetUserByUserNameUseCase } from './use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUseCase } from './use-cases/login/login.usecase';
import { RefreshAccessTokenUseCase } from './use-cases/refresh-access-token/refresh-access-token.usecase';
import { ValidateUserUseCase } from './use-cases/validate-user/validate-user.usecase';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [
    ApiConfigModule,
    JwtModule.register({}),
    PassportModule,
    PrismaModule,
    RedisCacheModule,
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    CreateUserUseCase,
    GetUserByUserNameUseCase,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    LocalStrategy,
    Logger,
    LoginUseCase,
    RefreshAccessTokenUseCase,
    UserRepository,
    ValidateUserUseCase,
  ],
})
export class UsersModule {}
