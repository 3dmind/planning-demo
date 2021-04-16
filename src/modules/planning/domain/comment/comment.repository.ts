import { CommentId } from './comment-id.entity';
import { Comment } from './comment.entity';

export abstract class CommentRepository {
  abstract exists(commentId: CommentId): Promise<boolean>;
  abstract save(comment: Comment): Promise<void>;
}
