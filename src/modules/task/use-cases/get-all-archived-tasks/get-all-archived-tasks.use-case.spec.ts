import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { TaskRepository } from '../../task.repository';
import { GetAllArchivedTasksUseCase } from './get-all-archived-tasks.use-case';

describe('GetAllArchivedTasksUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllArchivedTasksUseCase: GetAllArchivedTasksUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllArchivedTasksUseCase,
      ],
    }).compile();

    getAllArchivedTasksUseCase = await module.resolve<
      GetAllArchivedTasksUseCase
    >(GetAllArchivedTasksUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail on any error', async () => {
    mockedTaskRepository.getArchivedTasks.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await getAllArchivedTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const task1 = new TaskEntityBuilder().makeArchived().build();
    const task2 = new TaskEntityBuilder().makeArchived().build();
    mockedTaskRepository.getArchivedTasks.mockResolvedValueOnce([task1, task2]);

    const result = await getAllArchivedTasksUseCase.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toContain(task1);
    expect(result.value.getValue()).toContain(task2);
  });
});
