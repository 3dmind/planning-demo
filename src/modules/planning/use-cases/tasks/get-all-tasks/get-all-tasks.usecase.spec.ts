import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { TaskRepository } from '../../../repositories/task.repository';
import { GetAllTasksUsecase } from './get-all-tasks.usecase';

describe('GetAllTasksUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllTasksUseCase: GetAllTasksUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    getAllTasksUseCase = await module.resolve<GetAllTasksUsecase>(
      GetAllTasksUsecase,
    );
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
  });

  it('should fail on any error', async () => {
    mockedTaskRepository.getTasks.mockImplementation(() => {
      throw new Error();
    });

    const result = await getAllTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task1 = new TaskEntityBuilder(text).build();
    const task2 = new TaskEntityBuilder(text).build();
    mockedTaskRepository.getTasks.mockResolvedValue([task1, task2]);

    const result = await getAllTasksUseCase.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toContain(task1);
    expect(result.value.getValue()).toContain(task2);
  });
});
