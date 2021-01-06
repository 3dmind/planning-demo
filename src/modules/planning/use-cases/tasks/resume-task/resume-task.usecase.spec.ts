import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { ResumeTaskDto } from './resume-task.dto';
import { ResumeTaskErrors } from './resume-task.errors';
import { ResumeTaskUsecase } from './resume-task.usecase';

describe('ResumeTaskUsecase', () => {
  let taskRepository: TaskRepository;
  let useCase: ResumeTaskUsecase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        ResumeTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<ResumeTaskUsecase>(ResumeTaskUsecase);
  });

  it('should fail if task-id cannot be created', async () => {
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
    const request: ResumeTaskDto = { taskId: null };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if a task cannot be found', async () => {
    const taskId = faker.random.uuid();
    const request: ResumeTaskDto = { taskId };

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResumeTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail on any other error', async () => {
    const taskId = faker.random.uuid();
    const request: ResumeTaskDto = { taskId };
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
    const task = new TaskEntityBuilder().makeTickedOff().build();
    const request: ResumeTaskDto = { taskId: task.taskId.id.toString() };
    await taskRepository.save(task);

    const result = await useCase.execute(request);
    const resumedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(resumedTask.isTickedOff()).toBe(false);
  });
});
