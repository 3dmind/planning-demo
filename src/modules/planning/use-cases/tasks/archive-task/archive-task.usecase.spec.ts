import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { ArchiveTaskDto } from './archive-task.dto';
import { ArchiveTaskErrors } from './archive-task.errors';
import { ArchiveTaskUsecase } from './archive-task.usecase';

describe('ArchiveTaskUsecase', () => {
  let taskRepository: TaskRepository;
  let useCase: ArchiveTaskUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        ArchiveTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<ArchiveTaskUsecase>(ArchiveTaskUsecase);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
    const request: ArchiveTaskDto = { taskId: null };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    const request: ArchiveTaskDto = { taskId };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ArchiveTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const request: ArchiveTaskDto = { taskId };
    const spy = jest
      .spyOn(taskRepository, 'getTaskByTaskId')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    const request: ArchiveTaskDto = { taskId: task.taskId.id.toString() };
    await taskRepository.save(task);

    const result = await useCase.execute(request);
    const archivedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(archivedTask.isArchived()).toBe(true);
  });
});
