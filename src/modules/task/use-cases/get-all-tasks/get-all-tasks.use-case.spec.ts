import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { Description } from '../../domain/description';
import { Task } from '../../domain/task';
import { TaskRepository } from '../../task.repository';
import { GetAllTasksUseCase } from './get-all-tasks.use-case';

describe('GetAllTasksUseCase', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let getAllTasksUseCase: GetAllTasksUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        GetAllTasksUseCase,
      ],
    }).compile();

    getAllTasksUseCase = await module.resolve<GetAllTasksUseCase>(
      GetAllTasksUseCase,
    );
  });

  afterAll(() => {
    mockReset(mockedLogger);
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
    const description = Description.create(text).getValue();
    const task = Task.note(description).getValue();
    mockedTaskRepository.getTasks.mockResolvedValue([task]);

    const result = await getAllTasksUseCase.execute();

    expect(result.isRight()).toBe(true);
  });
});
