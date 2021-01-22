import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { ArchiveTaskErrors } from './archive-task.errors';

type Request = {
  taskId: string;
  userId: UserId;
};

type Response = Either<
  | ArchiveTaskErrors.MemberNotFoundError
  | ArchiveTaskErrors.TaskNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class ArchiveTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(ArchiveTaskUsecase.name);

  constructor(
    private memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Archiving task...');

    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdResult.isFailure) {
      this.logger.debug(taskIdResult.errorValue());
      return left(taskIdResult);
    }

    try {
      const {
        found: memberFound,
        member,
      } = await this.memberRepository.getMemberByUserId(request.userId.id);
      if (!memberFound) {
        const memberNotFoundError = new ArchiveTaskErrors.MemberNotFoundError(
          request.userId.id.toString(),
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const taskId = taskIdResult.getValue();
      const {
        found: taskFound,
        task,
      } = await this.taskRepository.getTaskOfOwnerByTaskId(
        member.ownerId,
        taskId,
      );
      if (!taskFound) {
        const taskNotFoundError = new ArchiveTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      task.archive();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully archived');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
