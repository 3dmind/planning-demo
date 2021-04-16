import * as faker from 'faker';
import { UniqueEntityId } from '../../../../shared/domain';
import { AuthorId } from '../author-id.entity';
import { TaskId } from '../task-id.entity';
import { CommentProps } from './comment-props.interface';
import { CommentText } from './comment-text.valueobject';
import { Comment } from './comment.entity';

describe('Comment', () => {
  it('should guard "commentText" property', () => {
    // Given
    const props = { commentText: null } as CommentProps;

    // When
    const result = Comment.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBeTruthy();
  });

  it('should guard "createdAt" property', () => {
    // Given
    const props = {
      commentText: CommentText.create(faker.lorem.sentence()).getValue(),
      createdAt: null,
    } as CommentProps;

    // When
    const result = Comment.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBeTruthy();
  });

  it('should guard "authorId" property', () => {
    // Given
    const props = {
      commentText: CommentText.create(faker.lorem.sentence()).getValue(),
      createdAt: new Date(),
      authorId: null,
    } as CommentProps;

    // When
    const result = Comment.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBeTruthy();
  });

  it('should guard "taskId" property', () => {
    // Given
    const props = {
      commentText: CommentText.create(faker.lorem.sentence()).getValue(),
      createdAt: new Date(),
      authorId: AuthorId.create().getValue(),
      taskId: null,
    } as CommentProps;

    // When
    const result = Comment.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBeTruthy();
  });

  it('should create comment', () => {
    // Given
    const props: CommentProps = {
      commentText: CommentText.create(faker.lorem.sentence()).getValue(),
      createdAt: new Date(),
      authorId: AuthorId.create().getValue(),
      taskId: TaskId.create().getValue(),
    };

    // When
    const result = Comment.create(props);

    // Then
    expect.assertions(1);
    expect(result.isSuccess).toBeTruthy();
  });

  it('should create comment with given props and ID', () => {
    // Given
    const uuid = faker.random.uuid();
    const entityId = new UniqueEntityId(uuid);
    const authorId = AuthorId.create().getValue();
    const commentText = CommentText.create(faker.lorem.sentence()).getValue();
    const createdAt = new Date();
    const taskId = TaskId.create().getValue();
    const props: CommentProps = {
      authorId,
      commentText,
      createdAt,
      taskId,
    };

    // When
    const result = Comment.create(props, entityId);
    const comment = result.getValue();

    // Then
    expect.assertions(5);
    expect(comment.authorId.equals(authorId)).toBeTruthy();
    expect(comment.commentId.id.equals(entityId)).toBeTruthy();
    expect(comment.commentText.equals(commentText)).toBeTruthy();
    expect(comment.createdAt).toBe(createdAt);
    expect(comment.taskId.equals(taskId)).toBeTruthy();
  });
});
