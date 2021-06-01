import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from './unique-entity-id';

jest.mock('uuid');

describe('UniqueEntityId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const entityId = new UniqueEntityId();

    // Then
    expect.assertions(1);
    expect(entityId).toBeDefined();
  });

  it('should create entity id from existing id', () => {
    // Given
    const uuid = faker.random.uuid();

    // When
    const entityId = new UniqueEntityId(uuid);

    // Then
    expect.assertions(1);
    expect(entityId.toValue()).toEqual(uuid);
  });

  it('should provide entity id as string', () => {
    // Given
    const uuid = faker.random.uuid();

    // When
    const entityId = new UniqueEntityId(uuid);

    // Then
    expect.assertions(1);
    expect(entityId.toString()).toEqual(uuid);
  });

  it('should ', () => {
    // Given
    const uuid = faker.random.uuid();

    // When
    const entityIdOne = new UniqueEntityId(uuid);
    const entityIdTwo = new UniqueEntityId(uuid);
    const entityIdThree = new UniqueEntityId();
    const entityId = {} as unknown as UniqueEntityId;

    // Then
    expect.assertions(5);
    expect(entityIdOne.equals(entityIdTwo)).toBe(true);
    expect(entityIdOne.equals(entityIdThree)).toBe(false);
    expect(entityIdOne.equals(null)).toBe(false);
    expect(entityIdOne.equals(undefined)).toBe(false);
    expect(entityIdOne.equals(entityId)).toBe(false);
  });
});
