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
  private readonly logger = new Logger(NoteTaskUsecase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request?: NoteTaskDto): Promise<Response> {
    this.logger.log('Noting new task...');
    const { text } = request;

    try {
      const descriptionResult = Description.create(text);

      if (descriptionResult.isFailure) {
        this.logger.debug(descriptionResult.errorValue());
        return left(descriptionResult);
      }

      const description = descriptionResult.getValue();
      const taskResult = Task.note(description);

      if (taskResult.isFailure) {
        this.logger.debug(taskResult.errorValue());
        return left(taskResult);
      }

      const task = taskResult.getValue();
      await this.taskRepository.save(task);
      this.logger.log('Task successfully noted');
      return right(Result.ok<Task>(task));
    } catch (error) {
      this.logger.error(error.message);
      return left(new AppErrors.UnexpectedError(error));
    }
  }
}
