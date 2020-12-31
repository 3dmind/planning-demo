import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { ResumeTaskDto } from './resume-task.dto';
import { ResumeTaskErrors } from './resume-task.errors';
import { ResumeTaskUsecase } from './resume-task.usecase';

describe('ResumeTaskUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: ResumeTaskUsecase;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        ResumeTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = module.get<ResumeTaskUsecase>(ResumeTaskUsecase);
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
    const request: ResumeTaskDto = { taskId: null };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    const request: ResumeTaskDto = { taskId };
    mockedTaskRepository.getTaskByTaskId.mockResolvedValue({
      found: false,
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResumeTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const request: ResumeTaskDto = { taskId };
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).makeTickedOff().build();
    const request: ResumeTaskDto = { taskId: task.taskId.id.toString() };
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute(request);
    const resumedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(resumedTask.isTickedOff()).toBe(false);
  });
});
