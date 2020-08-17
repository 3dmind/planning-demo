import { Injectable, Logger } from '@nestjs/common';
import {
  AppError,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { UniqueEntityID } from '../../../../shared/domain';
import { Task } from '../../domain/task';
import { TaskId } from '../../domain/task-id';
import { TaskRepository } from '../../task.repository';
import { TickOffTaskDto } from './tick-off-task.dto';
import { TickOffTasksErrors } from './tick-off-task.errors';

type Response = Either<
  AppError.UnexpectedError | TickOffTasksErrors.TaskNotFoundError | Result<any>,
  Result<Task>
>;

@Injectable()
export class TickOffTaskUseCase implements UseCase<TickOffTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('TickOffTaskUseCase');
  }

  async execute(request: TickOffTaskDto): Promise<Response> {
    const taskIdResult = TaskId.create(new UniqueEntityID(request.taskId));

    if (taskIdResult.isFailure) {
      this.logger.error(taskIdResult.errorValue());
      return left(taskIdResult);
    } else {
      try {
        const taskId = taskIdResult.getValue();
        const { found, task } = await this.taskRepository.getTaskByTaskId(
          taskId,
        );
        if (!found) {
          const taskNotFoundError = TickOffTasksErrors.TaskNotFoundError.create(
            request.taskId,
          );
          this.logger.error(taskNotFoundError.errorValue().message);
          return left(taskNotFoundError) as Response;
        } else {
          task.tickOff();
          await this.taskRepository.save(task);
          return right(Result.ok<Task>(task));
        }
      } catch (error) {
        this.logger.error(error.message, error);
        return left(AppError.UnexpectedError.create(error)) as Response;
      }
    }
  }
}
