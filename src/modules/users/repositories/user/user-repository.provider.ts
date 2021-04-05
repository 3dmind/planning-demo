import { Provider } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { PrismaUserRepository } from './implementations/prisma-user.repository';

export const UserRepositoryProvider: Provider = {
  provide: UserRepository,
  useClass: PrismaUserRepository,
};
