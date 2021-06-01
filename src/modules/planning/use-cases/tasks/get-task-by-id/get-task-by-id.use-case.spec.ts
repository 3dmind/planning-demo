import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { GetTaskByIdErrors } from './get-task-by-id.errors';
import { GetTaskByIdUseCase } from './get-task-by-id.use-case';

describe('GetTaskByIdUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: GetTaskByIdUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetTaskByIdUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<GetTaskByIdUseCase>(GetTaskByIdUseCase);
  });

  it('should fail if task-id entity cannot be created from request', async () => {
    // Given
    const taskId = faker.random.uuid();
    const errorMessage = 'error';
    const spy = jest.spyOn(TaskId, 'create').mockReturnValueOnce(Result.fail(errorMessage));

    // When
    const result = await useCase.execute({ taskId });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value.errorValue()).toEqual(errorMessage);

    spy.mockRestore();
  });

  it('should fail if task cannot be found', async () => {
    // Given
    const taskId = faker.random.uuid();

    // When
    const result = await useCase.execute({ taskId });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(GetTaskByIdErrors.TaskNotFoundError);
    expect(result.value.errorValue()).toEqual({
      message: `Could not find a task by the id {${taskId}}.`,
    });
  });

  it('should fail on any other error', async () => {
    // Given
    const taskId = faker.random.uuid();
    const spy = jest.spyOn(taskRepository, 'getTaskById').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ taskId });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should find task by its id', async () => {
    // Given
    const task = new TaskEntityBuilder().build();
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({ taskId: task.taskId.toString() });
    const foundTask = result.value.getValue() as Task;

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBeTruthy();
    expect(foundTask.equals(task)).toBeTruthy();
  });
});
