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
import { ArchiveTaskUsecase } from './use-cases/tasks/archive-task/archive-task.usecase';
import { AssignTaskUsecase } from './use-cases/tasks/assign-task/assign-task.usecase';
import { DiscardTaskUsecase } from './use-cases/tasks/discard-task/discard-task.usecase';
import { EditTaskUsecase } from './use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksUsecase } from './use-cases/tasks/get-all-active-tasks/get-all-active-tasks.usecase';
import { GetAllArchivedTasksUsecase } from './use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { GetTaskByIdUseCase } from './use-cases/tasks/get-task-by-id/get-task-by-id.use-case';
import { NoteTaskUsecase } from './use-cases/tasks/note-task/note-task.usecase';
import { ResumeTaskUsecase } from './use-cases/tasks/resume-task/resume-task.usecase';
import { TickOffTaskUsecase } from './use-cases/tasks/tick-off-task/tick-off-task.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, CommentsController],
  providers: [
    AfterUserRegisteredSubscriber,
    ArchiveTaskUsecase,
    AssignTaskUsecase,
    CommentOnTaskUsecase,
    CommentRepositoryProvider,
    CreateMemberUsecase,
    DiscardTaskUsecase,
    EditTaskUsecase,
    GetAllActiveTasksUsecase,
    GetAllArchivedTasksUsecase,
    GetMemberByUserIdUseCase,
    GetMemberEntityByUserIdPipe,
    GetTaskEntityByIdPipe,
    GetTaskByIdUseCase,
    Logger,
    MemberRepositoryProvider,
    NoteTaskUsecase,
    ResumeTaskUsecase,
    TaskRepositoryProvider,
    TickOffTaskUsecase,
  ],
})
export class PlanningModule {}
