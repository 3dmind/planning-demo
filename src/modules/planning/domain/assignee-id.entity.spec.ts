import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from './assignee-id.entity';

jest.mock('uuid');

describe('AssigneeId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = AssigneeId.create();
    const assigneeId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(assigneeId).toBeDefined();
    expect(assigneeId).toBeInstanceOf(AssigneeId);
    expect(assigneeId.id).toBeDefined();
    expect(assigneeId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = AssigneeId.create(entityId);
    const assigneeId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(assigneeId).toBeDefined();
    expect(assigneeId).toBeInstanceOf(AssigneeId);
    expect(assigneeId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const assigneeId = AssigneeId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(assigneeId.toString()).toEqual(idFixture);
  });
});
