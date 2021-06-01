import { InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../test/builder/task-entity.builder';
import { TaskId } from '../modules/planning/domain/task-id.entity';
import { TaskRepository } from '../modules/planning/domain/task.repository';
import { InMemoryTaskRepository } from '../modules/planning/repositories/task/implementations/in-memory-task.repository';
import { GetTaskByIdUseCase } from '../modules/planning/use-cases/tasks/get-task-by-id/get-task-by-id.use-case';
import { Result } from '../shared/core';
import { GetTaskEntityByIdPipe } from './get-task-entity-by-id.pipe';

describe('GetTaskEntityByIdPipe', () => {
  let taskRepository: TaskRepository;
  let pipe: GetTaskEntityByIdPipe;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetTaskByIdUseCase,
        GetTaskEntityByIdPipe,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    pipe = module.get<GetTaskEntityByIdPipe>(GetTaskEntityByIdPipe);
  });

  it('should throw UnprocessableEntityException if task-id cannot be created', async () => {
    // Given
    const taskId = faker.random.uuid();
    const spy = jest.spyOn(TaskId, 'create').mockReturnValueOnce(Result.fail('error'));

    // When
    const promise = pipe.transform(taskId);

    // Then
    expect.assertions(1);
    await expect(promise).rejects.toThrow(UnprocessableEntityException);

    spy.mockRestore();
  });

  it('should throw NotFoundException if the task cannot be found', async () => {
    // Given
    const taskId = faker.random.uuid();

    // When
    const promise = pipe.transform(taskId);

    // Then
    expect.assertions(1);
    await expect(promise).rejects.toThrow(NotFoundException);
  });

  it('should throw InternalServerErrorException on any other error', async () => {
    // Given
    const taskId = faker.random.uuid();
    const spy = jest.spyOn(taskRepository, 'getTaskById').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const promise = pipe.transform(taskId);
    await expect(promise).rejects.toThrow(InternalServerErrorException);

    // Then
    expect.assertions(1);

    spy.mockRestore();
  });

  it('should get task by its id', async () => {
    // Given
    const task = new TaskEntityBuilder().build();
    await taskRepository.save(task);

    // When
    const result = await pipe.transform(task.taskId.toString());

    // Then
    expect.assertions(1);
    expect(result.equals(task)).toBeTruthy();
  });
});
