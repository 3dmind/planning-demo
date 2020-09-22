import * as faker from 'faker';
import * as uuid from 'uuid';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskPropsInterface } from './task-props.interface';
import { TaskEntity } from './task.entity';

jest.mock('uuid');

describe('TaskEntity', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  describe('Guard task properties', () => {
    it('should guard "description against "null" and "undefined"', () => {
      const propsWithNull = { description: null } as TaskPropsInterface;
      const propsWithUndefinedDescription = {} as TaskPropsInterface;

      const taskResultNull = TaskEntity.create(propsWithNull);
      const taskResultUndefined = TaskEntity.create(
        propsWithUndefinedDescription,
      );

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "createdAt" against "null" and "undefined"', () => {
      const description = DescriptionValueObject.create(
        faker.lorem.words(5),
      ).getValue();

      const propsWithNull = {
        description,
        createdAt: null,
      } as TaskPropsInterface;

      const propsWithUndefinedCreatedDate = {
        description,
      } as TaskPropsInterface;

      const taskResultNull = TaskEntity.create(propsWithNull);
      const taskResultUndefined = TaskEntity.create(
        propsWithUndefinedCreatedDate,
      );

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "tickedOff" against "null" and "undefined"', () => {
      const description = DescriptionValueObject.create(
        faker.lorem.words(5),
      ).getValue();
      const createdAt = new Date();

      const propsWithNull = {
        description,
        createdAt,
        tickedOff: null,
      } as TaskPropsInterface;

      const propsWithUndefinedTickedOff = {
        description,
        createdAt,
      } as TaskPropsInterface;

      const taskResultNull = TaskEntity.create(propsWithNull);
      const taskResultUndefined = TaskEntity.create(
        propsWithUndefinedTickedOff,
      );

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "archived" against "null" and "undefined"', () => {
      const description = DescriptionValueObject.create(
        faker.lorem.words(5),
      ).getValue();
      const createdAt = new Date();
      const tickedOff = false;

      const propsWithNull = {
        description,
        createdAt,
        tickedOff,
        archived: null,
      } as TaskPropsInterface;

      const propsWithUndefinedArchived = {
        description,
        createdAt,
        tickedOff,
      } as TaskPropsInterface;

      const taskResultNull = TaskEntity.create(propsWithNull);
      const taskResultUndefined = TaskEntity.create(propsWithUndefinedArchived);

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });

    it('should guard "discarded" against "null" and "undefined"', () => {
      const description = DescriptionValueObject.create(
        faker.lorem.words(5),
      ).getValue();
      const createdAt = new Date();
      const tickedOff = false;
      const archived = false;

      const propsWithNull = {
        description,
        createdAt,
        tickedOff,
        archived,
        discarded: null,
      } as TaskPropsInterface;

      const propsWithUndefinedDiscarded = {
        description,
        createdAt,
        tickedOff,
        archived,
      } as TaskPropsInterface;

      const taskResultNull = TaskEntity.create(propsWithNull);
      const taskResultUndefined = TaskEntity.create(
        propsWithUndefinedDiscarded,
      );

      expect(taskResultNull.isFailure).toBe(true);
      expect(taskResultUndefined.isFailure).toBe(true);
    });
  });

  it('should create task', () => {
    const text = faker.lorem.words(5);
    const entityId = new UniqueEntityId();
    const description = DescriptionValueObject.create(text).getValue();

    const taskResult = TaskEntity.create(
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
    const newDescription = DescriptionValueObject.create(newText).getValue();

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
