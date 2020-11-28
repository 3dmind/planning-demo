import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { LocalPassportStrategy } from './strategies/local-passport.strategy';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { LoginUseCase } from './use-cases/login/login.usecase';
import { ValidateUserUseCase } from './use-cases/validate-user/validate-user.usecase';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('APP_SECRET'),
        signOptions: {
          expiresIn: '60s',
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    LocalPassportStrategy,
    Logger,
    LoginUseCase,
    UserRepository,
    ValidateUserUseCase,
  ],
})
export class UsersModule {}
