import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Task } from '../modules/planning/domain/task.entity';
import { GetTaskByIdErrors } from '../modules/planning/use-cases/tasks/get-task-by-id/get-task-by-id.errors';
import { GetTaskByIdUseCase } from '../modules/planning/use-cases/tasks/get-task-by-id/get-task-by-id.use-case';
import { AppErrors } from '../shared/core';

@Injectable()
export class GetTaskEntityByIdPipe implements PipeTransform<string, Promise<Task>> {
  constructor(private readonly getTaskByIdUseCase: GetTaskByIdUseCase) {}

  public async transform(taskId: string): Promise<Task> {
    const result = await this.getTaskByIdUseCase.execute({ taskId });
    if (result.isRight()) {
      return result.value.getValue();
    }

    if (result.isLeft()) {
      const error = result.value;
      switch (Reflect.getPrototypeOf(error).constructor) {
        case GetTaskByIdErrors.TaskNotFoundError:
          throw new NotFoundException(error.errorValue().message);
        case AppErrors.UnexpectedError:
          throw new InternalServerErrorException(error.errorValue().message);
        default:
          throw new UnprocessableEntityException(error.errorValue());
      }
    }
  }
}
