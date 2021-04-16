import { Guard, Result } from '../../../../shared/core';
import { Entity, UniqueEntityId } from '../../../../shared/domain';
import { AuthorId } from '../author-id.entity';
import { TaskId } from '../task-id.entity';
import { CommentId } from './comment-id.entity';
import { CommentProps } from './comment-props.interface';
import { CommentText } from './comment-text.valueobject';

export class Comment extends Entity<CommentProps> {
  private constructor(props: CommentProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get authorId(): AuthorId {
    return this.props.authorId;
  }

  get commentId(): CommentId {
    return CommentId.create(this._id).getValue();
  }

  get commentText(): CommentText {
    return this.props.commentText;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get taskId(): TaskId {
    return this.props.taskId;
  }

  public static create(
    props: CommentProps,
    id?: UniqueEntityId,
  ): Result<Comment> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.authorId, argumentName: 'authorId' },
      { argument: props.commentText, argumentName: 'commentText' },
      { argument: props.createdAt, argumentName: 'createdAt' },
      { argument: props.taskId, argumentName: 'taskId' },
    ]);
    if (!nullGuard.succeeded) {
      return Result.fail(nullGuard.message);
    } else {
      return Result.ok(new Comment(props, id));
    }
  }

  public static write(
    commentText: CommentText,
    authorId: AuthorId,
    taskId: TaskId,
  ): Result<Comment> {
    return Comment.create({
      authorId,
      commentText,
      createdAt: new Date(),
      taskId,
    });
  }
}
