import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { TaskId } from './task-id.entity';

jest.mock('uuid');

describe('TaskId', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it('should create new entity id', () => {
    // When
    const result = TaskId.create();
    const taskId = result.getValue();

    // Then
    expect.assertions(5);
    expect(result.isSuccess).toBe(true);
    expect(taskId).toBeDefined();
    expect(taskId).toBeInstanceOf(TaskId);
    expect(taskId.id).toBeDefined();
    expect(taskId.id.toValue()).toEqual(expect.any(String));
  });

  it('should create new entity id from existing id', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const result = TaskId.create(entityId);
    const taskId = result.getValue();

    // Then
    expect.assertions(4);
    expect(result.isSuccess).toBe(true);
    expect(taskId).toBeDefined();
    expect(taskId).toBeInstanceOf(TaskId);
    expect(taskId.id.toValue()).toEqual(idFixture);
  });

  it('should implement toString() method', () => {
    // Given
    const idFixture = faker.random.uuid();
    const entityId = new UniqueEntityId(idFixture);

    // When
    const taskId = TaskId.create(entityId).getValue();

    // Then
    expect.assertions(1);
    expect(taskId.toString()).toEqual(idFixture);
  });
});
