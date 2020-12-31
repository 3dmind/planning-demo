import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { DiscardTaskDto } from './discard-task.dto';
import { DiscardTaskErrors } from './discard-task.errors';
import { DiscardTaskUsecase } from './discard-task.usecase';

describe('DiscardTaskUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: DiscardTaskUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        DiscardTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<DiscardTaskUsecase>(DiscardTaskUsecase);
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
    const request: DiscardTaskDto = { taskId: null };

    const result = await useCase.execute(request);

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
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const request: DiscardTaskDto = { taskId };
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const task = new TaskEntityBuilder().build();
    const request: DiscardTaskDto = { taskId: task.taskId.id.toString() };
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute(request);
    const discardedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(discardedTask.isDiscarded()).toBe(true);
  });
});
