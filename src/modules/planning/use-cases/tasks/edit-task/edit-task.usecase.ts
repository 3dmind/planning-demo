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
  private readonly logger = new Logger(EditTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Editing task...');
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    const descriptionResult = Description.create(request.text);
    const requestResult = Result.combine([taskIdResult, descriptionResult]);

    if (requestResult.isFailure) {
      this.logger.debug(requestResult.error);
      return left(Result.fail<void>(requestResult.error));
    }

    try {
      const taskId = taskIdResult.getValue();
      const { found, task } = await this.taskRepository.getTaskByTaskId(taskId);

      if (!found) {
        const taskNotFoundError = new EditTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

      task.edit(descriptionResult.getValue());
      await this.taskRepository.save(task);
      this.logger.log('Task successfully edited');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
