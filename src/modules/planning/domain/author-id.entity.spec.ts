import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { AuthorId } from './author-id.entity';

jest.mock('uuid');

describe('AuthorId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = AuthorId.create();
    const authorId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(authorId).toBeDefined();
    expect(authorId).toBeInstanceOf(AuthorId);
    expect(authorId.id).toBeDefined();
    expect(authorId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = AuthorId.create(entityId);
    const authorId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(authorId).toBeDefined();
    expect(authorId).toBeInstanceOf(AuthorId);
    expect(authorId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const authorId = AuthorId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(authorId.toString()).toEqual(idFixture);
  });
});
