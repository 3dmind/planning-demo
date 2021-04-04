import { CacheModule, Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as redisStore from 'cache-manager-redis-store';
import { ApiConfigModule } from '../../api-config/api-config.module';
import { ApiConfigService } from '../../api-config/api-config.service';
import { DomainEventPublisherModule } from '../../domain-event-publisher/domain-event-publisher.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './controllers/users.controller';
import { UserRepositoryProvider } from './repositories/providers';
import { AuthService } from './services/auth.service';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GetUserByUserNameUsecase } from './use-cases/get-user-by-user-name/get-user-by-user-name.usecase';
import { LoginUsecase } from './use-cases/login/login.usecase';
import { LogoutUsecase } from './use-cases/logout/logout.usecase';
import { RefreshAccessTokenUsecase } from './use-cases/refresh-access-token/refresh-access-token.usecase';
import { RegisterUserUsecase } from './use-cases/register-user/register-user.usecase';
import { ValidateUserUsecase } from './use-cases/validate-user/validate-user.usecase';

@Module({
  imports: [
    ApiConfigModule,
    CacheModule.registerAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        store: redisStore,
        host: apiConfigService.getRedisHost(),
        port: apiConfigService.getRedisPort(),
      }),
    }),
    DomainEventPublisherModule,
    JwtModule.register({}),
    PassportModule,
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    GetUserByUserNameUsecase,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    LocalStrategy,
    Logger,
    LoginUsecase,
    LogoutUsecase,
    RefreshAccessTokenUsecase,
    RegisterUserUsecase,
    UserRepositoryProvider,
    ValidateUserUsecase,
  ],
})
export class UsersModule {}
