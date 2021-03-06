import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { OwnerId } from './owner-id.entity';

jest.mock('uuid');

describe('OwnerId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = OwnerId.create();
    const ownerId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(ownerId).toBeDefined();
    expect(ownerId).toBeInstanceOf(OwnerId);
    expect(ownerId.id).toBeDefined();
    expect(ownerId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = OwnerId.create(entityId);
    const ownerId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(ownerId).toBeDefined();
    expect(ownerId).toBeInstanceOf(OwnerId);
    expect(ownerId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const ownerId = OwnerId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(ownerId.toString()).toEqual(idFixture);
  });
});
