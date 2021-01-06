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
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { DiscardTaskDto } from './discard-task.dto';
import { DiscardTaskErrors } from './discard-task.errors';

type Response = Either<
  AppErrors.UnexpectedError | DiscardTaskErrors.TaskNotFoundError | Result<any>,
  Result<Task>
>;

@Injectable()
export class DiscardTaskUsecase implements UseCase<DiscardTaskDto, Response> {
  private readonly logger = new Logger(DiscardTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: DiscardTaskDto): Promise<Response> {
    this.logger.log('Discarding task...');
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));

    if (taskIdResult.isFailure) {
      this.logger.debug(taskIdResult.errorValue());
      return left(taskIdResult);
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);

      if (!found) {
        const taskNotFoundError = new DiscardTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      task.discard();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully discarded');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
