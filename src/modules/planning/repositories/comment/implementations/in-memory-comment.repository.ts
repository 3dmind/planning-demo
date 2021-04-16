import { Injectable } from '@nestjs/common';
import { CommentId } from '../../../domain/comment/comment-id.entity';
import { Comment } from '../../../domain/comment/comment.entity';
import { CommentRepository } from '../../../domain/comment/comment.repository';

/**
 * In-memory implementation of the comment repository.
 * Use for test purposes only!
 * @example
 * Test.createTestingModule({
 *   providers: [{
 *     provide: CommentRepository,
 *     useClass: InMemoryCommentRepository,
 *   }]
 * })
 */
@Injectable()
export class InMemoryCommentRepository extends CommentRepository {
  private readonly comments = new Map<string, Comment>();

  constructor() {
    super();
  }

  public async exists(commentId: CommentId): Promise<boolean> {
    return this.comments.has(commentId.toString());
  }

  public async save(comment: Comment): Promise<void> {
    this.comments.set(comment.commentId.toString(), comment);
  }
}
