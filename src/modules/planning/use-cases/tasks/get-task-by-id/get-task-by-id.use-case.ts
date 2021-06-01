import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { GetTaskByIdErrors } from './get-task-by-id.errors';

type Request = {
  taskId: string;
};

type Response = Either<GetTaskByIdErrors.TaskNotFoundError | AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class GetTaskByIdUseCase implements UseCase<Request, Response> {
  private readonly logger: Logger = new Logger(GetTaskByIdUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  public async execute(request: Request): Promise<Response> {
    this.logger.log('Finding task by its id...');

    const taskIdOrError = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdOrError.isFailure) {
      return left(taskIdOrError);
    }

    try {
      const taskId = taskIdOrError.getValue();
      const { found, task } = await this.taskRepository.getTaskById(taskId);

      if (!found) {
        const taskNotFoundError = new GetTaskByIdErrors.TaskNotFoundError(taskId);
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      } else {
        this.logger.log('Task successfully found.');
        return right(Result.ok(task));
      }
    } catch (error) {
      this.logger.debug(error.message, error.stack);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
