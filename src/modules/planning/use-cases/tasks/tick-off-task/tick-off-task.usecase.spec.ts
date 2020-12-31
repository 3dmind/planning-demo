import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { TickOffTaskDto } from './tick-off-task.dto';
import { TickOffTasksErrors } from './tick-off-task.errors';
import { TickOffTaskUsecase } from './tick-off-task.usecase';

describe('TickOffTaskUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: TickOffTaskUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        TickOffTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<TickOffTaskUsecase>(TickOffTaskUsecase);
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));

    const request: TickOffTaskDto = { taskId: null };
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

    const request: TickOffTaskDto = { taskId };
    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(TickOffTasksErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const request: TickOffTaskDto = { taskId };
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    const request: TickOffTaskDto = { taskId: task.taskId.id.toString() };
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute(request);
    const tickedOffTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(tickedOffTask.isTickedOff()).toBe(true);
  });
});
