import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { TaskRepository } from '../../../repositories/task.repository';
import { GetAllActiveTasksUsecase } from './get-all-active-tasks.usecase';

describe('GetAllActiveTasksUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllActiveTasksUseCase: GetAllActiveTasksUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllActiveTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    getAllActiveTasksUseCase = await module.resolve<GetAllActiveTasksUsecase>(
      GetAllActiveTasksUsecase,
    );
  });

  afterAll(() => {
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
