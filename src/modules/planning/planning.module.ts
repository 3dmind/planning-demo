import { Logger, Module } from '@nestjs/common';
import { GetMemberEntityByUserIdPipe } from '../../pipes/get-member-entity-by-user-id.pipe';
import { GetTaskEntityByIdPipe } from '../../pipes/get-task-entity-by-id.pipe';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommentsController } from './controllers/comments.controller';
import { TasksController } from './controllers/tasks.controller';
import { CommentRepositoryProvider, MemberRepositoryProvider, TaskRepositoryProvider } from './repositories/providers';
import { AfterUserRegisteredSubscriber } from './subscribers/after-user-registered.subscriber';
import { CommentOnTaskUsecase } from './use-cases/comments/comment-on-task/comment-on-task.usecase';
import { CreateMemberUsecase } from './use-cases/members/create-member/create-member.usecase';
import { GetMemberByUserIdUseCase } from './use-cases/members/get-member-by-user-id/get-member-by-user-id.use-case';
import { ArchiveTaskUseCase } from './use-cases/tasks/archive-task/archive-task.use-case';
import { AssignTaskUseCase } from './use-cases/tasks/assign-task/assign-task.use-case';
import { DiscardTaskUseCase } from './use-cases/tasks/discard-task/discard-task.use-case';
import { EditTaskUsecase } from './use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksUseCase } from './use-cases/tasks/get-all-active-tasks/get-all-active-tasks.use-case';
import { GetAllArchivedTasksUsecase } from './use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { GetTaskByIdUseCase } from './use-cases/tasks/get-task-by-id/get-task-by-id.use-case';
import { NoteTaskUseCase } from './use-cases/tasks/note-task/note-task.use-case';
import { ResumeTaskUseCase } from './use-cases/tasks/resume-task/resume-task.use-case';
import { TickOffTaskUseCase } from './use-cases/tasks/tick-off-task/tick-off-task.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, CommentsController],
  providers: [
    AfterUserRegisteredSubscriber,
    ArchiveTaskUseCase,
    AssignTaskUseCase,
    CommentOnTaskUsecase,
    CommentRepositoryProvider,
    CreateMemberUsecase,
    DiscardTaskUseCase,
    EditTaskUsecase,
    GetAllActiveTasksUseCase,
    GetAllArchivedTasksUsecase,
    GetMemberByUserIdUseCase,
    GetMemberEntityByUserIdPipe,
    GetTaskEntityByIdPipe,
    GetTaskByIdUseCase,
    Logger,
    MemberRepositoryProvider,
    NoteTaskUseCase,
    ResumeTaskUseCase,
    TaskRepositoryProvider,
    TickOffTaskUseCase,
  ],
})
export class PlanningModule {}
