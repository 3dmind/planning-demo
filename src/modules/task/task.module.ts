import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskController } from './task.controller';
import { TaskModel } from './task.model';
import { TaskRepository } from './task.repository';
import { ArchiveTaskUseCase } from './use-cases/archive-task/archive-task.use-case';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';
import { ResumeTaskUseCase } from './use-cases/resume-task/resume-task.use-case';
import { TickOffTaskUseCase } from './use-cases/tick-off-task/tick-off-task.use-case';

@Module({
  imports: [SequelizeModule.forFeature([TaskModel])],
  controllers: [TaskController],
  providers: [
    Logger,
    TaskRepository,
    GetAllTasksUseCase,
    NoteTaskUseCase,
    TickOffTaskUseCase,
    ResumeTaskUseCase,
    ArchiveTaskUseCase,
  ],
})
export class TaskModule {}
