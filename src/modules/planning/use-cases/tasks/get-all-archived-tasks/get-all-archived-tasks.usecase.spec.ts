import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { TaskRepository } from '../../../repositories/task.repository';
import { GetAllArchivedTasksUsecase } from './get-all-archived-tasks.usecase';

describe('GetAllArchivedTasksUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllArchivedTasksUseCase: GetAllArchivedTasksUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllArchivedTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    getAllArchivedTasksUseCase = await module.resolve<
      GetAllArchivedTasksUsecase
    >(GetAllArchivedTasksUsecase);
  });

  afterAll(() => {
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
