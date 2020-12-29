import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskIdEntity } from '../../../domain/task-id.entity';
import { TaskEntity } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { ResumeTaskErrors } from './resume-task.errors';
import { ResumeTaskUsecase } from './resume-task.usecase';

describe('ResumeTaskUsecase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: ResumeTaskUsecase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        ResumeTaskUsecase,
      ],
    }).compile();

    useCase = module.get<ResumeTaskUsecase>(ResumeTaskUsecase);
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
    expect(result.value).toBeInstanceOf(ResumeTaskErrors.TaskNotFoundError);
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
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).makeTickedOff().build();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });

    const result = await useCase.execute({ taskId: task.taskId.id.toString() });

    expect(result.isRight()).toBe(true);

    const resumedTask: TaskEntity = result.value.getValue();
    expect(resumedTask.isTickedOff()).toBe(false);
  });
});
