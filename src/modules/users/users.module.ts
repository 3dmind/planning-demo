import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { UserRepository } from './user.repository';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [Logger, UserRepository, CreateUserUseCase],
})
export class UsersModule {}
