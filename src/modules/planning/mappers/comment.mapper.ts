import { Prisma } from '@prisma/client';
import { Comment } from '../domain/comment/comment.entity';

export class CommentMapper {
  public static toPersistence(comment: Comment): Prisma.CommentModelCreateInput {
    return {
      commentId: comment.commentId.toString(),
      createdAt: comment.createdAt,
      memberModel: {
        connect: {
          memberId: comment.authorId.toString(),
        },
      },
      taskModel: {
        connect: {
          taskId: comment.taskId.toString(),
        },
      },
      text: comment.commentText.value,
    };
  }
}
