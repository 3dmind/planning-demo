import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../../shared/domain';
import { CommentId } from './comment-id.entity';

jest.mock('uuid');

describe('CommentId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = CommentId.create();
    const commentId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(commentId).toBeDefined();
    expect(commentId).toBeInstanceOf(CommentId);
    expect(commentId.id).toBeDefined();
    expect(commentId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = CommentId.create(entityId);
    const commentId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(commentId).toBeDefined();
    expect(commentId).toBeInstanceOf(CommentId);
    expect(commentId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const commentId = CommentId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(commentId.toString()).toEqual(idFixture);
  });
});
