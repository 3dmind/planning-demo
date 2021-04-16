import { AuthorId } from '../author-id.entity';
import { TaskId } from '../task-id.entity';
import { CommentText } from './comment-text.valueobject';

export interface CommentProps {
  authorId: AuthorId;
  commentText: CommentText;
  createdAt: Date;
  taskId: TaskId;
}
