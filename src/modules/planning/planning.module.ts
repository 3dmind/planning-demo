import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TasksController } from './controllers/tasks.controller';
import { TaskRepository } from './repositories/task.repository';
import { ArchiveTaskUsecase } from './use-cases/tasks/archive-task/archive-task.usecase';
import { DiscardTaskUsecase } from './use-cases/tasks/discard-task/discard-task.usecase';
import { EditTaskUsecase } from './use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksUsecase } from './use-cases/tasks/get-all-active-tasks/get-all-active-tasks.usecase';
import { GetAllArchivedTasksUsecase } from './use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { GetAllTasksUsecase } from './use-cases/tasks/get-all-tasks/get-all-tasks.usecase';
import { NoteTaskUsecase } from './use-cases/tasks/note-task/note-task.usecase';
import { ResumeTaskUsecase } from './use-cases/tasks/resume-task/resume-task.usecase';
import { TickOffTaskUsecase } from './use-cases/tasks/tick-off-task/tick-off-task.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [
    ArchiveTaskUsecase,
    DiscardTaskUsecase,
    EditTaskUsecase,
    GetAllActiveTasksUsecase,
    GetAllArchivedTasksUsecase,
    GetAllTasksUsecase,
    Logger,
    NoteTaskUsecase,
    ResumeTaskUsecase,
    TaskRepository,
    TickOffTaskUsecase,
  ],
})
export class PlanningModule {}
