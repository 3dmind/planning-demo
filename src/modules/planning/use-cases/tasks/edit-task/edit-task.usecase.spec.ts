import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { EditTaskErrors } from './edit-task.errors';
import { EditTaskUsecase } from './edit-task.usecase';

describe('EditTaskUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let useCase: EditTaskUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        EditTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    useCase = await module.resolve<EditTaskUsecase>(EditTaskUsecase);
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
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
    mockedTaskRepository.getTaskByTaskId.mockResolvedValue({
      found: false,
    });

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
    mockedTaskRepository.getTaskByTaskId.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await useCase.execute({ taskId, text });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    mockedTaskRepository.getTaskByTaskId.mockResolvedValueOnce({
      found: true,
      task,
    });
    const newText = faker.lorem.words(5);

    const result = await useCase.execute({
      taskId: task.taskId.id.toString(),
      text: newText,
    });
    const editedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(editedTask.props.description.value).toBe(newText);
  });
});
