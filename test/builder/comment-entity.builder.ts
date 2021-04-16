import * as faker from 'faker';
import { AuthorId } from '../../src/modules/planning/domain/author-id.entity';
import { CommentText } from '../../src/modules/planning/domain/comment/comment-text.valueobject';
import { Comment } from '../../src/modules/planning/domain/comment/comment.entity';
import { TaskId } from '../../src/modules/planning/domain/task-id.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class CommentEntityBuilder {
  private authorId: AuthorId;
  private commentText: CommentText;
  private createdAt: Date;
  private entityId: UniqueEntityId;
  private taskId: TaskId;

  constructor() {
    this.authorId = AuthorId.create().getValue();
    this.commentText = CommentText.create(faker.lorem.sentence()).getValue();
    this.createdAt = new Date();
    this.entityId = new UniqueEntityId();
    this.taskId = TaskId.create().getValue();
  }

  public build(): Comment {
    return Comment.create(
      {
        authorId: this.authorId,
        commentText: this.commentText,
        createdAt: this.createdAt,
        taskId: this.taskId,
      },
      this.entityId,
    ).getValue();
  }
}
