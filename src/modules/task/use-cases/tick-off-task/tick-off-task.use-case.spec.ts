import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppError, Result } from '../../../../shared/core';
import { Description } from '../../domain/description';
import { Task } from '../../domain/task';
import { TaskId } from '../../domain/task-id';
import { TaskRepository } from '../../task.repository';
import { TickOffTasksErrors } from './tick-off-task.errors';
import { TickOffTaskUseCase } from './tick-off-task.use-case';

describe('TickOffTaskUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: TickOffTaskUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        TickOffTaskUseCase,
      ],
    }).compile();

    useCase = await module.resolve<TickOffTaskUseCase>(TickOffTaskUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
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
    expect(result.value).toBeInstanceOf(TickOffTasksErrors.TaskNotFoundError);
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
    expect(result.value).toBeInstanceOf(AppError.UnexpectedError);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const task = Task.note(description).getValue();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute({ taskId: task.taskId.id.toString() });

    expect(result.isRight()).toBe(true);

    const tickedOffTask: Task = result.value.getValue();
    expect(tickedOffTask.isTickedOff()).toBe(true);
  });
});
