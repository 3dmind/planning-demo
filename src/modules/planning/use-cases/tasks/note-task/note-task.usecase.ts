import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { Description } from '../../../domain/description.valueobject';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { NoteTaskDto } from './note-task.dto';

type Response = Either<AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class NoteTaskUsecase implements UseCase<NoteTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {
    this.logger.setContext('NoteTaskUsecase');
  }

  async execute(request?: NoteTaskDto): Promise<Response> {
    const { text } = request;

    try {
      const descriptionOrError = Description.create(text);

      if (descriptionOrError.isFailure) {
        this.logger.error(descriptionOrError.errorValue());
        return left(descriptionOrError);
      }

      const description = descriptionOrError.getValue();
      const taskOrError = Task.note(description);

      if (taskOrError.isFailure) {
        this.logger.error(taskOrError.errorValue());
        return left(taskOrError);
      }

      const task = taskOrError.getValue();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully created.');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.toString());
      return left(AppErrors.UnexpectedError.create(error));
    }
  }
}
