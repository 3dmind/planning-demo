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
import { DiscardTaskErrors } from './discard-task.errors';

type Request = {
  taskId: string;
  userId: UserId;
};

type Response = Either<
  | DiscardTaskErrors.MemberNotFoundError
  | DiscardTaskErrors.TaskNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class DiscardTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(DiscardTaskUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Discarding task...');

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
        const memberNotFoundError = new DiscardTaskErrors.MemberNotFoundError(
          request.userId,
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const taskId = taskIdResult.getValue();
      const { found: taskFound, task } = await this.taskRepository.getTaskById(
        taskId,
      );
      if (!taskFound) {
        const taskNotFoundError = new DiscardTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      if (task.isDiscarded()) {
        this.logger.debug('Task is already discarded.');
        return right(Result.ok(task));
      }

      const result = task.discard(member.ownerId);
      if (result.isFailure) {
        return left(result);
      } else {
        await this.taskRepository.save(task);
        0;
        this.logger.log('Task successfully discarded.');
        return right(Result.ok<Task>(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
