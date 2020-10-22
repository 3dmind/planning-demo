import { Logger, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TaskController } from './task.controller';
import { TaskRepository } from './task.repository';
import { ArchiveTaskUseCase } from './use-cases/archive-task/archive-task.use-case';
import { DiscardTaskUseCase } from './use-cases/discard-task/discard-task.use-case';
import { EditTaskUseCase } from './use-cases/edit-task/edit-task.use-case';
import { GetAllActiveTasksUseCase } from './use-cases/get-all-active-tasks/get-all-active-tasks.use-case';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';
import { ResumeTaskUseCase } from './use-cases/resume-task/resume-task.use-case';
import { TickOffTaskUseCase } from './use-cases/tick-off-task/tick-off-task.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [
    Logger,
    TaskRepository,
    GetAllTasksUseCase,
    NoteTaskUseCase,
    TickOffTaskUseCase,
    ResumeTaskUseCase,
    ArchiveTaskUseCase,
    EditTaskUseCase,
    DiscardTaskUseCase,
    GetAllActiveTasksUseCase,
  ],
})
export class TaskModule {}
