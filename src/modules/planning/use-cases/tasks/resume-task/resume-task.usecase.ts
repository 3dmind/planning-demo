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
import { ResumeTaskErrors } from './resume-task.errors';

type Request = {
  taskId: string;
  userId: UserId;
};

type Response = Either<
  | ResumeTaskErrors.TaskNotFoundError
  | ResumeTaskErrors.MemberNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class ResumeTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(ResumeTaskUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Resuming task...');

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
        const memberNotFoundError = new ResumeTaskErrors.MemberNotFoundError(
          request.userId.id.toString(),
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const taskId = taskIdResult.getValue();
      const { found: taskFound, task } = await this.taskRepository.getTaskById(
        taskId,
      );
      if (!taskFound) {
        const taskNotFoundError = new ResumeTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      const result = task.resume(member.assigneeId);
      if (result.isFailure) {
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.log('Task successfully resumed');
        return right(Result.ok(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
