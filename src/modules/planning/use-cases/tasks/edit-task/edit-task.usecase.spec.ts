import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { EditTaskErrors } from './edit-task.errors';
import { EditTaskUsecase } from './edit-task.usecase';

describe('EditTaskUsecase', () => {
  let taskRepository: TaskRepository;
  let useCase: EditTaskUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        EditTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<EditTaskUsecase>(EditTaskUsecase);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));

    const result = await useCase.execute({
      taskId: null,
      text: faker.lorem.words(5),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if new description cannot be created', async () => {
    const taskId = faker.random.uuid();
    const text = '';

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toContain(
      'Text is not at least 2 chars.',
    );
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    const text = faker.lorem.words(5);

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EditTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const text = faker.lorem.words(5);
    const spy = jest
      .spyOn(taskRepository, 'getTaskByTaskId')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    const newText = faker.lorem.words(5);
    await taskRepository.save(task);

    const result = await useCase.execute({
      taskId: task.taskId.id.toString(),
      text: newText,
    });
    const editedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(editedTask.props.description.value).toBe(newText);
  });
});
