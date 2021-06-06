import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { Description } from '../../../domain/description.valueobject';
import { Member } from '../../../domain/member.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { EditTaskDto } from './edit-task.dto';

type Request = {
  dto: EditTaskDto;
  member: Member;
  task: Task;
};

type Response = Either<AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class EditTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(EditTaskUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Editing task...');

    const { dto, member, task } = request;

    const descriptionResult = Description.create(dto.text);
    if (descriptionResult.isFailure) {
      this.logger.debug(descriptionResult.error);
      return left(descriptionResult);
    }

    try {
      const newDescription = descriptionResult.getValue();
      if (task.description.equals(newDescription)) {
        this.logger.debug('Task already has this description.');
        return right(Result.ok(task));
      }

      const result = task.edit(newDescription, member.ownerId);
      if (result.isFailure) {
        this.logger.debug(result.errorValue());
        return left(result);
      } else {
        await this.taskRepository.save(task);
        this.logger.log('Task successfully edited.');
        return right(Result.ok<Task>(task));
      }
    } catch (error) {
      this.logger.error(error.message, error);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
