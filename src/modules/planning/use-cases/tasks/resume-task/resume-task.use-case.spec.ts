import { Test } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { ResumeTaskUseCase } from './resume-task.use-case';

describe('ResumeTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: ResumeTaskUseCase;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        ResumeTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<ResumeTaskUseCase>(ResumeTaskUseCase);
  });

  it('should fail if the memeber is not assigned to the task', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().makeTickedOff().build();

    // When
    const result = await useCase.execute({
      member,
      task,
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(task.isTickedOff()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).makeTickedOff().build();
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({
      member,
      task,
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not resume a task which is not ticked-off', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).makeResumed().build();
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const resumeSpy = jest.spyOn(task, 'resume');

    // When
    const result = await useCase.execute({
      member,
      task,
    });
    const resumedTask: Task = result.value.getValue();

    // Then
    expect.assertions(4);
    expect(result.isRight()).toBe(true);
    expect(resumedTask.isTickedOff()).toBe(false);
    expect(resumeSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();

    resumeSpy.mockRestore();
    saveSpy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).makeTickedOff().build();

    // When
    const result = await useCase.execute({
      member,
      task,
    });
    const resumedTask: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(resumedTask.isTickedOff()).toBe(false);
  });
});
