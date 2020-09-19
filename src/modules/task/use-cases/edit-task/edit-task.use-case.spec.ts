import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../shared/core';
import { TaskIdEntity } from '../../domain/task-id.entity';
import { TaskEntity } from '../../domain/task.entity';
import { TaskRepository } from '../../task.repository';
import { EditTaskErrors } from './edit-task.errors';
import { EditTaskUseCase } from './edit-task.use-case';

describe('EditTaskUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: EditTaskUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        EditTaskUseCase,
      ],
    }).compile();

    useCase = await module.resolve<EditTaskUseCase>(EditTaskUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskIdEntity, 'create')
      .mockReturnValue(Result.fail<TaskIdEntity>('error'));

    const result = await useCase.execute({
      taskId: null,
      text: faker.lorem.words(5),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if new description cannot be created', async () => {
    const taskId = faker.random.uuid();
    const text = '';

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toContain(
      'Text is not at least 2 chars.',
    );
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    const text = faker.lorem.words(5);
    mockedTaskRepository.getTaskByTaskId.mockResolvedValue({
      found: false,
    });

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EditTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const text = faker.lorem.words(5);
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });
    const newText = faker.lorem.words(5);

    const result = await useCase.execute({
      taskId: task.taskId.id.toString(),
      text: newText,
    });

    expect(result.isRight()).toBe(true);

    const editedTask: TaskEntity = result.value.getValue();
    expect(editedTask.props.description.value).toBe(newText);
  });
});
