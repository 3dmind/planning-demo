import { Provider } from '@nestjs/common';
import { CommentRepository } from '../../domain/comment/comment.repository';
import { PrismaCommentRepository } from './implementations/prisma-comment.repository';

export const CommentRepositoryProvider: Provider = {
  provide: CommentRepository,
  useClass: PrismaCommentRepository,
};
