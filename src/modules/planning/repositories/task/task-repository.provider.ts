import { Provider } from '@nestjs/common';
import { PrismaTaskRepository } from './prisma-task.repository';
import { TaskRepository } from './task.repository';

export const TaskRepositoryProvider: Provider = {
  provide: TaskRepository,
  useClass: PrismaTaskRepository,
};
