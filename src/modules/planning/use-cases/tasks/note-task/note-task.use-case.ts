import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, Result, right, UseCase } from '../../../../../shared/core';
import { Description } from '../../../domain/description.valueobject';
import { Member } from '../../../domain/member.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { NoteTaskDto } from './note-task.dto';

type Request = {
  dto: NoteTaskDto;
  member: Member;
};
type Response = Either<AppErrors.UnexpectedError | Result<any>, Result<Task>>;

@Injectable()
export class NoteTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(NoteTaskUseCase.name);

  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Noting new task...');

    const { dto, member } = request;

    try {
      const descriptionResult = Description.create(dto.text);
      if (descriptionResult.isFailure) {
        this.logger.debug(descriptionResult.errorValue());
        return left(descriptionResult);
      }

      const description = descriptionResult.getValue();
      const taskResult = Task.note(description, member.ownerId, member.assigneeId);
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
