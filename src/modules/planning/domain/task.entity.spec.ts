import * as faker from 'faker';
import * as uuid from 'uuid';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { Description } from './description.valueobject';
import { TaskId } from './task-id.entity';
import { TaskProps } from './task-props.interface';
import { Task } from './task.entity';

jest.mock('uuid');

describe('Task', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  describe('Guard task properties', () => {
    it('should guard "description against "null" and "undefined"', () => {
      const propsWithNull = { description: null } as TaskProps;
      const propsWithUndefinedDescription = {} as TaskProps;

      const taskResultNull = Task.create(propsWithNull);
      const taskResultUndefined = Task.create(propsWithUndefinedDescription);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "createdAt" against "null" and "undefined"', () => {
      const description = Description.create(faker.lorem.words(5)).getValue();

      const propsWithNull = {
        description,
        createdAt: null,
      } as TaskProps;

      const propsWithUndefinedCreatedDate = {
        description,
      } as TaskProps;

      const taskResultNull = Task.create(propsWithNull);
      const taskResultUndefined = Task.create(propsWithUndefinedCreatedDate);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "tickedOff" against "null" and "undefined"', () => {
      const description = Description.create(faker.lorem.words(5)).getValue();
      const createdAt = new Date();

      const propsWithNull = {
        description,
        createdAt,
        tickedOff: null,
      } as TaskProps;

      const propsWithUndefinedTickedOff = {
        description,
        createdAt,
      } as TaskProps;

      const taskResultNull = Task.create(propsWithNull);
      const taskResultUndefined = Task.create(propsWithUndefinedTickedOff);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "archived" against "null" and "undefined"', () => {
      const description = Description.create(faker.lorem.words(5)).getValue();
      const createdAt = new Date();
      const tickedOff = false;

      const propsWithNull = {
        description,
        createdAt,
        tickedOff,
        archived: null,
      } as TaskProps;

      const propsWithUndefinedArchived = {
        description,
        createdAt,
        tickedOff,
      } as TaskProps;

      const taskResultNull = Task.create(propsWithNull);
      const taskResultUndefined = Task.create(propsWithUndefinedArchived);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "discarded" against "null" and "undefined"', () => {
      const description = Description.create(faker.lorem.words(5)).getValue();
      const createdAt = new Date();
      const tickedOff = false;
      const archived = false;

      const propsWithNull = {
        description,
        createdAt,
        tickedOff,
        archived,
        discarded: null,
      } as TaskProps;

      const propsWithUndefinedDiscarded = {
        description,
        createdAt,
        tickedOff,
        archived,
      } as TaskProps;

      const taskResultNull = Task.create(propsWithNull);
      const taskResultUndefined = Task.create(propsWithUndefinedDiscarded);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });
  });

  it('should create task', () => {
    const text = faker.lorem.words(5);
    const entityId = new UniqueEntityId();
    const description = Description.create(text).getValue();

    const taskResult = Task.create(
      {
        archived: false,
        archivedAt: null,
        createdAt: new Date(),
        description,
        discarded: false,
        discardedAt: null,
        editedAt: null,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    );
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskId);
    expect(task.taskId.id.equals(entityId)).toBe(true);
  });

  it('should note new task', () => {
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();

    const taskResult = Task.note(description);
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId.id.toValue()).toBeDefined();
  });

  it('should tick off task', () => {
    const task = new TaskEntityBuilder().build();

    task.tickOff();

    expect(task.isTickedOff()).toBe(true);
  });

  it('should resume task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().makeTickedOff().build();

    task.resume();

    expect(task.isTickedOff()).toBe(false);
  });

  it('should archive task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().build();

    task.archive();

    expect(task.isArchived()).toBe(true);
  });

  it('should edit description', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    const newText = faker.lorem.words(5);
    const newDescription = Description.create(newText).getValue();

    task.edit(newDescription);

    expect(task.props.description.equals(newDescription)).toBe(true);
  });

  it('should discard task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().build();

    task.discard();

    expect(task.isDiscarded()).toBe(true);
  });
});
