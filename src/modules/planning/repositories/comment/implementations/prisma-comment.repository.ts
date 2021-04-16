import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { CommentId } from '../../../domain/comment/comment-id.entity';
import { Comment } from '../../../domain/comment/comment.entity';
import { CommentRepository } from '../../../domain/comment/comment.repository';
import { CommentMapper } from '../../../mappers/comment.mapper';

@Injectable()
export class PrismaCommentRepository extends CommentRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  public async exists(commentId: CommentId): Promise<boolean> {
    const commentModel = await this.prismaService.commentModel.findFirst({
      where: {
        commentId: commentId.toString(),
      },
    });
    return !!commentModel === true;
  }

  public async save(comment: Comment): Promise<void> {
    const exists = await this.exists(comment.commentId);
    if (!exists) {
      const commentModelCreateInput = CommentMapper.toPersistence(comment);
      await this.prismaService.commentModel.create({
        data: commentModelCreateInput,
      });
    }
  }
}
