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
import { Description } from '../../../domain/description.valueobject';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { EditTaskErrors } from './edit-task.errors';

type Request = {
  taskId: string;
  text: string;
};

type Response = Either<
  AppErrors.UnexpectedError | EditTaskErrors.TaskNotFoundError | Result<any>,
  Result<Task>
>;

@Injectable()
export class EditTaskUsecase implements UseCase<Request, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('EditTaskUsecase');
  }

  async execute(request: Request): Promise<Response> {
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    const descriptionResult = Description.create(request.text);
    const requestResult = Result.combine([taskIdResult, descriptionResult]);

    if (requestResult.isFailure) {
      this.logger.error(requestResult.error);
      return left(Result.fail<void>(requestResult.error)) as Response;
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);

      if (!found) {
        const taskNotFoundError = EditTaskErrors.TaskNotFoundError.create(
          request.taskId,
        );
        this.logger.error(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError) as Response;
      }

      task.edit(descriptionResult.getValue());
      await this.taskRepository.save(task);
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(AppErrors.UnexpectedError.create(error)) as Response;
    }
  }
}
