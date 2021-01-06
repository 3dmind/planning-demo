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
import { TickOffTaskDto } from './tick-off-task.dto';
import { TickOffTasksErrors } from './tick-off-task.errors';

type Response = Either<
  | AppErrors.UnexpectedError
  | TickOffTasksErrors.TaskNotFoundError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class TickOffTaskUsecase implements UseCase<TickOffTaskDto, Response> {
  private readonly logger = new Logger(TickOffTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: TickOffTaskDto): Promise<Response> {
    this.logger.log('Ticking off task...');

    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdResult.isFailure) {
      this.logger.error(taskIdResult.errorValue());
      return left(taskIdResult);
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);
      if (!found) {
        const taskNotFoundError = new TickOffTasksErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.error(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      task.tickOff();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully ticked off');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
