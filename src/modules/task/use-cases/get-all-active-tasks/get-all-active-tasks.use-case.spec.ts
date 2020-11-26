import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { TaskRepository } from '../../task.repository';
import { GetAllActiveTasksUseCase } from './get-all-active-tasks.use-case';

describe('GetAllActiveTasksUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllActiveTasksUseCase: GetAllActiveTasksUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllActiveTasksUseCase,
      ],
    }).compile();

    getAllActiveTasksUseCase = await module.resolve<GetAllActiveTasksUseCase>(
      GetAllActiveTasksUseCase,
    );
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail on any error', async () => {
    mockedTaskRepository.getActiveTasks.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await getAllActiveTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const task1 = new TaskEntityBuilder().build();
    const task2 = new TaskEntityBuilder().build();
    mockedTaskRepository.getActiveTasks.mockResolvedValueOnce([task1, task2]);

    const result = await getAllActiveTasksUseCase.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toContain(task1);
    expect(result.value.getValue()).toContain(task2);
  });
});