import { Prisma, TaskModel } from '@prisma/client';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { Task } from '../domain/task.entity';
import { TaskDto } from '../dtos/task.dto';
import { TaskMapper } from './task.mapper';

describe('TaskMapper', () => {
  describe('map Entity to DTO', () => {
    it('should map noted Task to DTO', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder().withDescription(text).build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        discardedAt: null,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isDiscarded: false,
        isTickedOff: false,
        resumedAt: null,
        tickedOffAt: null,
      });
    });

    it('should map ticked-off Task to DTO', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        discardedAt: null,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isDiscarded: false,
        isTickedOff: true,
        resumedAt: null,
        tickedOffAt: expect.any(String),
      });
    });

    it('should map resumed Task to DTO', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .makeResumed()
        .build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        discardedAt: null,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isDiscarded: false,
        isTickedOff: false,
        resumedAt: expect.any(String),
        tickedOffAt: expect.any(String),
      });
    });

    it('should map archived Task to DTO', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .makeResumed()
        .makeArchived()
        .build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject<TaskDto>({
        archivedAt: expect.any(String),
        createdAt: expect.any(String),
        description: text,
        discardedAt: null,
        editedAt: null,
        id: expect.any(String),
        isArchived: true,
        isDiscarded: false,
        isTickedOff: false,
        resumedAt: expect.any(String),
        tickedOffAt: expect.any(String),
      });
    });

    it('should map edited Task to DTO', () => {
      // Given
      const newText = faker.lorem.words(5);
      const task = new TaskEntityBuilder().makeEdited(newText).build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: newText,
        discardedAt: null,
        editedAt: expect.any(String),
        id: expect.any(String),
        isArchived: false,
        isDiscarded: false,
        isTickedOff: false,
        resumedAt: null,
        tickedOffAt: null,
      });
    });

    it('should map discarded Task to DTO', () => {
      // Given
      const task = new TaskEntityBuilder().makeDiscarded().build();

      // When
      const dto = TaskMapper.toDto(task);

      // Then
      expect.assertions(1);
      expect(dto).toMatchObject({
        archivedAt: null,
        createdAt: expect.any(String),
        description: expect.any(String),
        discardedAt: expect.any(String),
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isDiscarded: true,
        isTickedOff: false,
        resumedAt: null,
        tickedOffAt: null,
      });
    });
  });

  describe('map Entity to Model', () => {
    it('should map noted Task to Model', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder().withDescription(text).build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        discarded: false,
        discardedAt: null,
        editedAt: null,
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: null,
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });

    it('should map ticked-off Task to Model', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        discarded: false,
        discardedAt: null,
        editedAt: null,
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: true,
        tickedOffAt: expect.any(Date),
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });

    it('should map resumed Task to Model', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .makeResumed()
        .build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        discarded: false,
        discardedAt: null,
        editedAt: null,
        resumedAt: expect.any(Date),
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: expect.any(Date),
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });

    it('should map archived Task to Model', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeTickedOff()
        .makeResumed()
        .makeArchived()
        .build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: true,
        archivedAt: expect.any(Date),
        createdAt: expect.any(Date),
        description: text,
        editedAt: null,
        discarded: false,
        discardedAt: null,
        resumedAt: expect.any(Date),
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: expect.any(Date),
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });

    it('should map edited Task to Model', () => {
      // Given
      const newText = faker.lorem.words(5);
      const task = new TaskEntityBuilder().makeEdited(newText).build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: newText,
        discarded: false,
        discardedAt: null,
        editedAt: expect.any(Date),
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: null,
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });

    it('should map discarded Task to Model', () => {
      // Given
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder()
        .withDescription(text)
        .makeDiscarded()
        .build();

      // When
      const rawModel = TaskMapper.toPersistence(task);

      // Then
      expect.assertions(1);
      expect(rawModel).toMatchObject<Prisma.TaskModelCreateInput>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        discarded: true,
        discardedAt: expect.any(Date),
        editedAt: null,
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: null,
        ownerModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
        assigneeModel: {
          connect: {
            memberId: expect.any(String),
          },
        },
      });
    });
  });

  describe('map Model to Entity', () => {
    it('should map TaskModel to Task', () => {
      // Given
      const mockedText = faker.lorem.words(5);
      const mockedId = faker.random.uuid();
      const mockedOwnerId = faker.random.uuid();
      const mockedAssigneeId = faker.random.uuid();
      const mockedDate = new Date();
      const mockedTaskModel: TaskModel = {
        archived: true,
        archivedAt: mockedDate,
        createdAt: mockedDate,
        description: mockedText,
        discarded: true,
        discardedAt: mockedDate,
        editedAt: mockedDate,
        resumedAt: mockedDate,
        taskId: mockedId,
        tickedOff: true,
        tickedOffAt: mockedDate,
        updatedAt: mockedDate,
        ownerId: mockedOwnerId,
        assigneeId: mockedAssigneeId,
      };

      // When
      const taskEntity = TaskMapper.toDomain(mockedTaskModel);

      // Then
      expect.assertions(2);
      expect(taskEntity).toBeDefined();
      expect(taskEntity).toBeInstanceOf(Task);
    });
  });
});
