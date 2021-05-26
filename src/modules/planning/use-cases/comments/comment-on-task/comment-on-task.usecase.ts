import { Injectable, Logger } from '@nestjs/common';
import {
  AppErrors,
  Either,
  left,
  OrSpecification,
  Result,
  right,
  UseCase,
} from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { CommentText } from '../../../domain/comment/comment-text.valueobject';
import { Comment } from '../../../domain/comment/comment.entity';
import { CommentRepository } from '../../../domain/comment/comment.repository';
import { MemberId } from '../../../domain/member-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberMustBeTaskAssignee } from '../../../domain/specifications/member-must-be-task-assignee';
import { MemberMustBeTaskOwner } from '../../../domain/specifications/member-must-be-task-owner';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { CommentOnTaskDto } from './comment-on-task.dto';
import { CommentOnTaskErrors } from './comment-on-task.errors';

type Request = {
  dto: CommentOnTaskDto;
  taskId: string;
  member: Member;
};

type CommentOnTaskUsecaseErrors =
  | AppErrors.UnexpectedError
  | CommentOnTaskErrors.TaskNotFoundError
  | CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError
  | Result<any>;

type Response = Either<CommentOnTaskUsecaseErrors, Result<void>>;

@Injectable()
export class CommentOnTaskUsecase implements UseCase<Request, Response> {
  private readonly logger = new Logger(CommentOnTaskUsecase.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly taskRepository: TaskRepository,
  ) {}

  public async execute(request: Request): Promise<Response> {
    this.logger.log('Commenting on task...');

    const taskIdOrError = TaskId.create(new UniqueEntityId(request.taskId));
    if (taskIdOrError.isFailure) {
      this.logger.debug(taskIdOrError.errorValue());
      return left(taskIdOrError);
    }

    const getTaskResult = await this.getTask(taskIdOrError.getValue());
    if (getTaskResult.isLeft()) {
      return left(getTaskResult.value);
    }

    const writeCommentResult = this.writeComment(
      request.member,
      getTaskResult.value,
      request.dto,
    );
    if (writeCommentResult.isLeft()) {
      return left(writeCommentResult.value);
    }

    return await this.saveComment(writeCommentResult.value);
  }

  private async getTask(
    taskId: TaskId,
  ): Promise<
    Either<
      CommentOnTaskErrors.TaskNotFoundError | AppErrors.UnexpectedError,
      Task
    >
  > {
    try {
      const { found, task } = await this.taskRepository.getTaskById(taskId);

      if (!found) {
        const taskNotFoundError = new CommentOnTaskErrors.TaskNotFoundError(
          taskId,
        );
        this.logger.debug(taskNotFoundError.errorValue().message);
        return left(taskNotFoundError);
      } else {
        return right(task);
      }
    } catch (error) {
      const unexpectedError = new AppErrors.UnexpectedError(error);
      this.logger.debug(unexpectedError.errorValue().message);
      return left(unexpectedError);
    }
  }

  private writeComment(
    member: Member,
    task: Task,
    dto: CommentOnTaskDto,
  ): Either<
    CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError | Result<any>,
    Comment
  > {
    const { text } = dto;
    const textOrError = CommentText.create(text);
    if (textOrError.isFailure) {
      this.logger.debug(textOrError.errorValue());
      return left(textOrError);
    }

    const memberMustBeOwnerOrAssignee = new OrSpecification<MemberId>(
      new MemberMustBeTaskOwner(task),
      new MemberMustBeTaskAssignee(task),
    );

    if (!memberMustBeOwnerOrAssignee.satisfiedBy(member.memberId)) {
      const memberIsNeitherTaskOwnerNorAssigneeError = new CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError(
        member.memberId,
      );
      this.logger.debug(
        memberIsNeitherTaskOwnerNorAssigneeError.errorValue().message,
      );
      return left(memberIsNeitherTaskOwnerNorAssigneeError);
    }

    const commentOrError = Comment.write(
      textOrError.getValue(),
      member.authorId,
      task.taskId,
    );
    if (commentOrError.isFailure) {
      this.logger.debug(commentOrError.errorValue());
      return left(commentOrError);
    } else {
      return right(commentOrError.getValue());
    }
  }

  private async saveComment(
    comment: Comment,
  ): Promise<Either<AppErrors.UnexpectedError, Result<void>>> {
    try {
      await this.commentRepository.save(comment);
      this.logger.log('Successfully comment on task.');
      return right(Result.ok());
    } catch (error) {
      const unexpectedError = new AppErrors.UnexpectedError(error);
      this.logger.debug(unexpectedError.errorValue().message);
      return left(unexpectedError);
    }
  }
}
