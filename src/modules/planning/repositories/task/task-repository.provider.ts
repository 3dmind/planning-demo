import { Provider } from '@nestjs/common';
import { TaskRepository } from '../../domain/task.repository';
import { PrismaTaskRepository } from './implementations/prisma-task.repository';

export const TaskRepositoryProvider: Provider = {
  provide: TaskRepository,
  useClass: PrismaTaskRepository,
};
