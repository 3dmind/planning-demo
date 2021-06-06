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
import { GetUserByUserNameUseCase } from './use-cases/get-user-by-user-name/get-user-by-user-name.use-case';
import { LoginUseCase } from './use-cases/login/login.use-case';
import { LogoutUseCase } from './use-cases/logout/logout.use-case';
import { RefreshAccessTokenUseCase } from './use-cases/refresh-access-token/refresh-access-token.use-case';
import { RegisterUserUseCase } from './use-cases/register-user/register-user.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user/validate-user.use-case';

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
    GetUserByUserNameUseCase,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    LocalStrategy,
    Logger,
    LoginUseCase,
    LogoutUseCase,
    RefreshAccessTokenUseCase,
    RegisterUserUseCase,
    UserRepositoryProvider,
    ValidateUserUseCase,
  ],
})
export class UsersModule {}
