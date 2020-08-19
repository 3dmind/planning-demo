import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityId } from '../../../shared/domain';
import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskEntity } from './task.entity';

jest.mock('uuid');

describe('TaskEntity', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it(`should guard 'description' against 'null' or 'undefined'`, () => {
    const taskResultNull = TaskEntity.create({
      createdAt: null,
      description: null,
      resumedAt: null,
      tickedOff: null,
      tickedOffAt: null,
    });
    const taskResultUndefined = TaskEntity.create({
      createdAt: undefined,
      description: undefined,
      resumedAt: undefined,
      tickedOff: undefined,
      tickedOffAt: undefined,
    });

    expect(taskResultNull.isFailure).toBe(true);
    expect(taskResultUndefined.isFailure).toBe(true);
  });

  it('should create task', () => {
    const text = faker.lorem.words(5);
    const entityId = new UniqueEntityId();
    const description = DescriptionValueObject.create(text).getValue();

    const taskResult = TaskEntity.create(
      {
        createdAt: new Date(),
        description,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    );
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskIdEntity);
    expect(task.taskId.id.equals(entityId)).toBe(true);
  });

  it('should note new task', () => {
    const text = faker.lorem.words(5);
    const description = DescriptionValueObject.create(text).getValue();

    const taskResult = TaskEntity.note(description);
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId.id.toValue()).toBeDefined();
  });

  it('should tick off task', () => {
    const entityId = new UniqueEntityId();
    const text = faker.lorem.words(5);
    const description = DescriptionValueObject.create(text).getValue();
    const task = TaskEntity.create(
      {
        createdAt: new Date(),
        description,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    ).getValue();

    task.tickOff();

    expect(task.isTickedOff()).toBe(true);
  });

  it('should resume task', () => {
    expect.assertions(1);
    const entityId = new UniqueEntityId();
    const text = faker.lorem.words(5);
    const description = DescriptionValueObject.create(text).getValue();
    const task = TaskEntity.create(
      {
        createdAt: new Date(),
        description,
        resumedAt: null,
        tickedOff: true,
        tickedOffAt: new Date(),
      },
      entityId,
    ).getValue();

    task.resume();

    expect(task.isTickedOff()).toBe(false);
  });
});
