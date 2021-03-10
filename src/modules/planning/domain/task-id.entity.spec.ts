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

  it('should accept existing ID', () => {
    // Given
    const expectedId = faker.random.uuid();

    // When
    const taskIdResult = TaskId.create(new UniqueEntityId(expectedId));
    const taskId = taskIdResult.getValue();

    // Then
    expect.assertions(3);
    expect(taskIdResult.isSuccess).toBe(true);
    expect(taskId.id.toValue()).toEqual(expectedId);
    expect(taskId.toString()).toEqual(expectedId);
  });

  it('should create new ID', () => {
    // When
    const taskIdResult = TaskId.create();
    const taskId = taskIdResult.getValue();

    // Then
    expect.assertions(2);
    expect(taskIdResult.isSuccess).toBe(true);
    expect(taskId.id).toBeDefined();
  });
});
