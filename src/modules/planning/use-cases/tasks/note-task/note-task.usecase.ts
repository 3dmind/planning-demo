import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Description } from '../../../domain/description.valueobject';
import { Task } from '../../../domain/task.entity';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { NoteTaskDto } from './note-task.dto';
import { NoteTaskErrors } from './note-task.errors';

type Request = {
  userId: UserId;
  dto: NoteTaskDto;
};
type Response = Either<
  NoteTaskErrors.MemberNotFoundError | AppErrors.UnexpectedError | Result<any>,
  Result<Task>
>;

@Injectable()
export class NoteTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(NoteTaskUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Noting new task...');

    const { userId, dto } = request;

    try {
      const descriptionResult = Description.create(dto.text);
      if (descriptionResult.isFailure) {
        this.logger.debug(descriptionResult.errorValue());
        return left(descriptionResult);
      }

      const { found, member } = await this.memberRepository.getMemberByUserId(
        userId.id,
      );
      if (!found) {
        const memberNotFoundError = new NoteTaskErrors.MemberNotFoundError(
          userId.id.toString(),
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const description = descriptionResult.getValue();
      const taskResult = Task.note(
        description,
        member.ownerId,
        member.assigneeId,
      );
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
