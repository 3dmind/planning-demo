import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { UserId } from './user-id.entity';

jest.mock('uuid');

describe('UserId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = UserId.create();
    const userId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(userId).toBeDefined();
    expect(userId).toBeInstanceOf(UserId);
    expect(userId.id).toBeDefined();
    expect(userId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = UserId.create(entityId);
    const userId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(userId).toBeDefined();
    expect(userId).toBeInstanceOf(UserId);
    expect(userId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const userId = UserId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(userId.toString()).toEqual(idFixture);
  });
});
