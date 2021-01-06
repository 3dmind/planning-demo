import { Test, TestingModule } from '@nestjs/testing';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { GetAllTasksUsecase } from './get-all-tasks.usecase';

describe('GetAllTasksUsecase', () => {
  let taskRepository: TaskRepository;
  let getAllTasksUseCase: GetAllTasksUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetAllTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    getAllTasksUseCase = await module.resolve<GetAllTasksUsecase>(
      GetAllTasksUsecase,
    );
  });

  it('should fail on any error', async () => {
    const spy = jest
      .spyOn(taskRepository, 'getTasks')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await getAllTasksUseCase.execute();

    expect(result.isLeft()).toBe(true);

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

    const result = await getAllTasksUseCase.execute();
    const allTasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(allTasks).toContain(task1);
    expect(allTasks).toContain(task2);
    expect(allTasks).toContain(task3);
    expect(allTasks).toContain(task4);
  });
});
