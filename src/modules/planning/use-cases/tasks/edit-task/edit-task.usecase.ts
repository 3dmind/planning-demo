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
import { UserId } from '../../../../users/domain/user-id.entity';
import { Description } from '../../../domain/description.valueobject';
import { MemberRepository } from '../../../domain/member.repository';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { EditTaskDto } from './edit-task.dto';
import { EditTaskErrors } from './edit-task.errors';

type Request = {
  dto: EditTaskDto;
  taskId: string;
  userId: UserId;
};

type Response = Either<
  | EditTaskErrors.MemberNotFoundError
  | EditTaskErrors.TaskNotFoundError
  | AppErrors.UnexpectedError
  | Result<any>,
  Result<Task>
>;

@Injectable()
export class EditTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(EditTaskUsecase.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    this.logger.log('Editing task...');
    const taskIdResult = TaskId.create(new UniqueEntityId(request.taskId));
    const descriptionResult = Description.create(request.dto.text);
    const requestResult = Result.combine([taskIdResult, descriptionResult]);

    if (requestResult.isFailure) {
      this.logger.debug(requestResult.error);
      return left(Result.fail<void>(requestResult.error));
    }

    try {
      const {
        found: memberFound,
        member,
      } = await this.memberRepository.getMemberByUserId(request.userId.id);
      if (!memberFound) {
        const memberNotFoundError = new EditTaskErrors.MemberNotFoundError(
          request.userId,
        );
        this.logger.debug(memberNotFoundError.errorValue().message);
        return left(memberNotFoundError);
      }

      const taskId = taskIdResult.getValue();
      const { found: taskFound, task } = await this.taskRepository.getTaskById(
        taskId,
      );
      if (!taskFound) {
        const taskNotFoundError = new EditTaskErrors.TaskNotFoundError(
          request.taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      }

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
