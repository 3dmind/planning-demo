import { CommentEntityBuilder } from '../../../../../../test/builder/comment-entity.builder';
import { CommentRepository } from '../../../domain/comment/comment.repository';
import { InMemoryCommentRepository } from './in-memory-comment.repository';

describe('InMemoryCommentRepository', () => {
  let repository: CommentRepository;

  beforeEach(() => {
    repository = new InMemoryCommentRepository();
  });

  it('should save comment', async () => {
    // Given
    const comment = new CommentEntityBuilder().build();

    // When
    const promise = repository.save(comment);

    // Then
    expect.assertions(1);
    await expect(promise).resolves.not.toThrow();
  });

  it('should find stored comment by id', async () => {
    // Given
    const comment = new CommentEntityBuilder().build();
    await repository.save(comment);

    // When
    const exists = await repository.exists(comment.commentId);

    // Then
    expect.assertions(1);
    expect(exists).toBeTruthy();
  });
});
