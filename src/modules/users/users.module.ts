import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiConfigModule } from '../../api-config/api-config.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisCacheModule } from '../../redis-cache/redis-cache.module';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { CreateUserUsecase } from './use-cases/create-user/create-user.usecase';
import { GetUserByUserNameUsecase } from './use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUsecase } from './use-cases/login/login.usecase';
import { LogoutUsecase } from './use-cases/logout/logout.usecase';
import { RefreshAccessTokenUsecase } from './use-cases/refresh-access-token/refresh-access-token.usecase';
import { ValidateUserUsecase } from './use-cases/validate-user/validate-user.usecase';

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
    CreateUserUsecase,
    GetUserByUserNameUsecase,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    LocalStrategy,
    Logger,
    LoginUsecase,
    LogoutUsecase,
    RefreshAccessTokenUsecase,
    UserRepository,
    ValidateUserUsecase,
  ],
})
export class UsersModule {}
