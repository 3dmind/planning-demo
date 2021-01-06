import { Test, TestingModule } from '@nestjs/testing';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { GetAllArchivedTasksUsecase } from './get-all-archived-tasks.usecase';

describe('GetAllArchivedTasksUsecase', () => {
  let taskRepository: TaskRepository;
  let getAllArchivedTasksUseCase: GetAllArchivedTasksUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetAllArchivedTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    getAllArchivedTasksUseCase = await module.resolve<
      GetAllArchivedTasksUsecase
    >(GetAllArchivedTasksUsecase);
  });

  it('should fail on any error', async () => {
    const spy = jest
      .spyOn(taskRepository, 'getArchivedTasks')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await getAllArchivedTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    const task1 = new TaskEntityBuilder().makeArchived().build();
    const task2 = new TaskEntityBuilder().makeArchived().build();
    const task3 = new TaskEntityBuilder().makeDiscarded().build();
    await taskRepository.save(task1);
    await taskRepository.save(task2);
    await taskRepository.save(task3);

    const result = await getAllArchivedTasksUseCase.execute();
    const archivedTasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(archivedTasks).toContain(task1);
    expect(archivedTasks).toContain(task2);
    expect(archivedTasks).not.toContain(task3);
  });
});
