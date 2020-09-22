import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../shared/core';
import { TaskIdEntity } from '../../domain/task-id.entity';
import { TaskEntity } from '../../domain/task.entity';
import { TaskRepository } from '../../task.repository';
import { DiscardTaskErrors } from './discard-task.errors';
import { DiscardTaskUseCase } from './discard-task.use-case';

describe('DiscardTaskUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: DiscardTaskUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        DiscardTaskUseCase,
      ],
    }).compile();

    useCase = await module.resolve<DiscardTaskUseCase>(DiscardTaskUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskIdEntity, 'create')
      .mockReturnValue(Result.fail<TaskIdEntity>('error'));
    const result = await useCase.execute({ taskId: null });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValue({
      found: false,
    });

    const result = await useCase.execute({ taskId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DiscardTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute({ taskId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const task = new TaskEntityBuilder().build();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute({ taskId: task.taskId.id.toString() });

    expect(result.isRight()).toBe(true);

    const discardedTask: TaskEntity = result.value.getValue();
    expect(discardedTask.isDiscarded()).toBe(true);
  });
});
