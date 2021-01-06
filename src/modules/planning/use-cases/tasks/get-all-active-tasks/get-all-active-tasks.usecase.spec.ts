import { Test, TestingModule } from '@nestjs/testing';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { GetAllActiveTasksUsecase } from './get-all-active-tasks.usecase';

describe('GetAllActiveTasksUsecase', () => {
  let taskRepository: TaskRepository;
  let getAllActiveTasksUseCase: GetAllActiveTasksUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetAllActiveTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    getAllActiveTasksUseCase = await module.resolve<GetAllActiveTasksUsecase>(
      GetAllActiveTasksUsecase,
    );
  });

  it('should fail on any error', async () => {
    const spy = jest
      .spyOn(taskRepository, 'getActiveTasks')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await getAllActiveTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    const task1 = new TaskEntityBuilder().build();
    const task2 = new TaskEntityBuilder().build();
    const task3 = new TaskEntityBuilder().makeArchived().build();
    const task4 = new TaskEntityBuilder().makeDiscarded().build();
    await taskRepository.save(task1);
    await taskRepository.save(task2);
    await taskRepository.save(task3);
    await taskRepository.save(task4);

    const result = await getAllActiveTasksUseCase.execute();
    const activeTasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(activeTasks).toContain(task1);
    expect(activeTasks).toContain(task2);
    expect(activeTasks).not.toContain(task3);
    expect(activeTasks).not.toContain(task4);
  });
});
