import { Provider } from '@nestjs/common';
import { PrismaUserRepository } from './prisma-user.repository';
import { UserRepository } from './user.repository';

export const UserRepositoryProvider: Provider = {
  provide: UserRepository,
  useClass: PrismaUserRepository,
};
