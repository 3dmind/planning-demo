import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCaseInterface,
} from '../../../../shared/core';
import { DescriptionValueObject } from '../../domain/description.value-object';
import { TaskEntity } from '../../domain/task.entity';
import { TaskRepository } from '../../task.repository';
import { NoteTaskDto } from './note-task.dto';

type Response = Either<
  AppErrors.UnexpectedError | Result<any>,
  Result<TaskEntity>
>;

@Injectable()
export class NoteTaskUseCase
  implements UseCaseInterface<NoteTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('NoteTaskUseCase');
  }

  async execute(request?: NoteTaskDto): Promise<Response> {
    const { text } = request;

    try {
      const descriptionOrError = DescriptionValueObject.create(text);

      if (descriptionOrError.isFailure) {
        this.logger.error(descriptionOrError.errorValue());
        return left(descriptionOrError);
      }

      const description = descriptionOrError.getValue();
      const taskOrError = TaskEntity.note(description);

      if (taskOrError.isFailure) {
        this.logger.error(taskOrError.errorValue());
        return left(taskOrError);
      }

      const task = taskOrError.getValue();
      await this.taskRepository.save(task);
      this.logger.log('TaskEntity successfully created.');
      return right(Result.ok<TaskEntity>(task));
    } catch (error) {
      this.logger.error(error.toString());
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
