import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { TaskIdEntity } from '../../../domain/task-id.entity';
import { TaskEntity } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { DiscardTaskDto } from './discard-task.dto';
import { DiscardTaskErrors } from './discard-task.errors';

type Response = Either<
  AppErrors.UnexpectedError | DiscardTaskErrors.TaskNotFoundError | Result<any>,
  Result<TaskEntity>
>;

@Injectable()
export class DiscardTaskUsecase
  implements UseCaseInterface<DiscardTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('DiscardTaskUsecase');
  }

  async execute(request: DiscardTaskDto): Promise<Response> {
    const taskIdResult = TaskIdEntity.create(
      new UniqueEntityId(request.taskId),
    );

    if (taskIdResult.isFailure) {
      this.logger.error(taskIdResult.errorValue());
      return left(taskIdResult) as Response;
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);

      if (!found) {
        const taskNotFoundError = DiscardTaskErrors.TaskNotFoundError.create(
          request.taskId,
        );
        this.logger.error(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError) as Response;
      }

      task.discard();
      await this.taskRepository.save(task);
      return right(Result.ok<TaskEntity>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error)) as Response;
    }
  }
}
