import { Prisma } from '@prisma/client';
import { CommentEntityBuilder } from '../../../../test/builder/comment-entity.builder';
import { CommentMapper } from './comment.mapper';

describe('CommentMapper', () => {
  it('should map Entity to Model', () => {
    // Given
    const comment = new CommentEntityBuilder().build();

    // When
    const commentModelCreateInput = CommentMapper.toPersistence(comment);

    // Then
    expect.assertions(1);
    expect(commentModelCreateInput).toMatchObject<Prisma.CommentModelCreateInput>({
      createdAt: expect.any(Date),
      commentId: expect.any(String),
      memberModel: {
        connect: {
          memberId: expect.any(String),
        },
      },
      taskModel: {
        connect: {
          taskId: expect.any(String),
        },
      },
      text: expect.any(String),
    });
  });
});
