import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LocalPassportStrategy } from './strategies/local-passport.strategy';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { ValidateUserUseCase } from './use-cases/validate-user/validate-user.usecase';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    LocalPassportStrategy,
    Logger,
    ValidateUserUseCase,
    UserRepository,
  ],
})
export class UsersModule {}
