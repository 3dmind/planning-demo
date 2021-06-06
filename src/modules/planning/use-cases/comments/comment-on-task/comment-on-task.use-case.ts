import { Injectable, Logger } from '@nestjs/common';
import { AppErrors, Either, left, OrSpecification, Result, right, UseCase } from '../../../../../shared/core';
import { CommentText } from '../../../domain/comment/comment-text.valueobject';
import { Comment } from '../../../domain/comment/comment.entity';
import { CommentRepository } from '../../../domain/comment/comment.repository';
import { MemberId } from '../../../domain/member-id.entity';
import { Member } from '../../../domain/member.entity';
import { MemberMustBeTaskAssignee } from '../../../domain/specifications/member-must-be-task-assignee';
import { MemberMustBeTaskOwner } from '../../../domain/specifications/member-must-be-task-owner';
import { Task } from '../../../domain/task.entity';
import { CommentOnTaskDto } from './comment-on-task.dto';
import { CommentOnTaskErrors } from './comment-on-task.errors';

type Request = {
  dto: CommentOnTaskDto;
  member: Member;
  task: Task;
};

type CommentOnTaskUsecaseErrors =
  | AppErrors.UnexpectedError
  | CommentOnTaskErrors.TaskNotFoundError
  | CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError
  | Result<any>;

type Response = Either<CommentOnTaskUsecaseErrors, Result<void>>;

@Injectable()
export class CommentOnTaskUseCase implements UseCase<Request, Response> {
  private readonly logger = new Logger(CommentOnTaskUseCase.name);

  constructor(private readonly commentRepository: CommentRepository) {}

  public async execute(request: Request): Promise<Response> {
    this.logger.log('Commenting on task...');

    const writeCommentResult = this.writeComment(request.member, request.task, request.dto);
    if (writeCommentResult.isLeft()) {
      return left(writeCommentResult.value);
    }

    return this.saveComment(writeCommentResult.value);
  }

  private writeComment(
    member: Member,
    task: Task,
    dto: CommentOnTaskDto,
  ): Either<CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError | Result<any>, Comment> {
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
      this.logger.debug(memberIsNeitherTaskOwnerNorAssigneeError.errorValue().message);
      return left(memberIsNeitherTaskOwnerNorAssigneeError);
    }

    const commentOrError = Comment.write(textOrError.getValue(), member.authorId, task.taskId);
    if (commentOrError.isFailure) {
      this.logger.debug(commentOrError.errorValue());
      return left(commentOrError);
    } else {
      return right(commentOrError.getValue());
    }
  }

  private async saveComment(comment: Comment): Promise<Either<AppErrors.UnexpectedError, Result<void>>> {
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
