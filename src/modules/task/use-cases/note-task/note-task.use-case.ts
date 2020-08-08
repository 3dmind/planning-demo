import { Injectable, Logger } from '@nestjs/common';
import {
  AppError,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../shared/core';
import { Description } from '../../domain/description';
import { Task } from '../../domain/task';
import { TaskRepository } from '../../task.repository';
import { NoteTaskDto } from './note-task.dto';

type Response = Either<AppError.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class NoteTaskUseCase implements UseCase<NoteTaskDto, Response> {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request?: NoteTaskDto): Promise<Response> {
    const { text } = request;

    try {
      const descriptionOrError = Description.create(text);

      if (descriptionOrError.isFailure) {
        this.logger.warn(descriptionOrError.errorValue());
        return left(descriptionOrError);
      }

      const description = descriptionOrError.getValue();
      const taskOrError = Task.note(description);

      if (taskOrError.isFailure) {
        this.logger.warn(taskOrError.errorValue());
        return left(taskOrError);
      }

      const task = taskOrError.getValue();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully created.');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.toString());
      return left(AppError.UnexpectedError.create(error));
    }
  }
}
