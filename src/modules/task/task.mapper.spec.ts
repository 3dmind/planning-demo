import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../test/builder/task-entity.builder';
import { TaskEntity } from './domain/task.entity';
import { RawTaskModelInterface } from './raw-task-model.interface';
import { TaskDto } from './task.dto';
import { TaskMapper } from './task.mapper';
import { TaskModel } from './task.model';

describe('TaskMapper', () => {
  describe('map Entity to DTO', () => {
    it('should map noted Task to DTO', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text).build();

      const dto = TaskMapper.toDto(task);

      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isTickedOff: false,
        resumedAt: null,
        tickedOffAt: null,
      });
    });

    it('should map ticked-off Task to DTO', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text).makeTickedOff().build();

      const dto = TaskMapper.toDto(task);

      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isTickedOff: true,
        resumedAt: null,
        tickedOffAt: expect.any(String),
      });
    });

    it('should map resumed Task to DTO', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text)
        .makeTickedOff()
        .makeResumed()
        .build();

      const dto = TaskMapper.toDto(task);

      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: text,
        editedAt: null,
        id: expect.any(String),
        isArchived: false,
        isTickedOff: false,
        resumedAt: expect.any(String),
        tickedOffAt: expect.any(String),
      });
    });

    it('should map archived Task to DTO', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text)
        .makeTickedOff()
        .makeResumed()
        .makeArchived()
        .build();

      const dto = TaskMapper.toDto(task);

      expect(dto).toMatchObject<TaskDto>({
        archivedAt: expect.any(String),
        createdAt: expect.any(String),
        description: text,
        editedAt: null,
        id: expect.any(String),
        isArchived: true,
        isTickedOff: false,
        resumedAt: expect.any(String),
        tickedOffAt: expect.any(String),
      });
    });

    it('should map edited Task to DTO', () => {
      const newText = faker.lorem.words(5);
      const task = new TaskEntityBuilder().makeEdited(newText).build();

      const dto = TaskMapper.toDto(task);

      expect(dto).toMatchObject<TaskDto>({
        archivedAt: null,
        createdAt: expect.any(String),
        description: newText,
        editedAt: expect.any(String),
        id: expect.any(String),
        isArchived: false,
        isTickedOff: false,
        resumedAt: null,
        tickedOffAt: null,
      });
    });
  });

  describe('map Entity to Model', () => {
    it('should map noted Task to Model', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text).build();

      const rawModel = TaskMapper.toPersistence(task);

      expect(rawModel).toMatchObject<RawTaskModelInterface>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        editedAt: null,
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: null,
      });
    });

    it('should map ticked-off Task to Model', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text).makeTickedOff().build();

      const rawModel = TaskMapper.toPersistence(task);

      expect(rawModel).toMatchObject<RawTaskModelInterface>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        editedAt: null,
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: true,
        tickedOffAt: expect.any(Date),
      });
    });

    it('should map resumed Task to Model', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text)
        .makeTickedOff()
        .makeResumed()
        .build();

      const rawModel = TaskMapper.toPersistence(task);

      expect(rawModel).toMatchObject<RawTaskModelInterface>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: text,
        editedAt: null,
        resumedAt: expect.any(Date),
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: expect.any(Date),
      });
    });

    it('should map archived Task to Model', () => {
      const text = faker.lorem.words(5);
      const task = new TaskEntityBuilder(text)
        .makeTickedOff()
        .makeResumed()
        .makeArchived()
        .build();

      const rawModel = TaskMapper.toPersistence(task);

      expect(rawModel).toMatchObject<RawTaskModelInterface>({
        archived: true,
        archivedAt: expect.any(Date),
        createdAt: expect.any(Date),
        description: text,
        editedAt: null,
        resumedAt: expect.any(Date),
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: expect.any(Date),
      });
    });

    it('should map edited Task to Model', () => {
      const newText = faker.lorem.words(5);
      const task = new TaskEntityBuilder().makeEdited(newText).build();

      const rawModel = TaskMapper.toPersistence(task);

      expect(rawModel).toMatchObject<RawTaskModelInterface>({
        archived: false,
        archivedAt: null,
        createdAt: expect.any(Date),
        description: newText,
        editedAt: expect.any(Date),
        resumedAt: null,
        taskId: expect.any(String),
        tickedOff: false,
        tickedOffAt: null,
      });
    });
  });

  describe('map Model to Entity', () => {
    it('should map TaskModel to Task', () => {
      const mockedText = faker.lorem.words(5);
      const mockedId = faker.random.uuid();
      const mockedDate = new Date();
      const mockedTaskModel = {
        archived: true,
        archivedAt: mockedDate,
        createdAt: mockedDate,
        description: mockedText,
        editedAt: mockedDate,
        resumedAt: mockedDate,
        taskId: mockedId,
        tickedOff: true,
        tickedOffAt: mockedDate,
      } as TaskModel;

      const taskEntity = TaskMapper.toDomain(mockedTaskModel);

      expect(taskEntity).toBeDefined();
      expect(taskEntity).toBeInstanceOf(TaskEntity);
    });
  });
});
