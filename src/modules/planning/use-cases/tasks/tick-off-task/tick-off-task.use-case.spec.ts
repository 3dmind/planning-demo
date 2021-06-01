import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { TickOffTaskUseCase } from './tick-off-task.use-case';

describe('TickOffTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: TickOffTaskUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        TickOffTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<TickOffTaskUseCase>(TickOffTaskUseCase);
  });

  it('should fail if the member is not assigned to the task', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();

    // When
    const result = await useCase.execute({
      member,
      task,
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(task.isTickedOff()).toBe(false);
  });

  it('should fail on any other error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).build();
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

  it('should not tick-off a task which is already ticked-off', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).makeTickedOff().build();
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const tickOffSpy = jest.spyOn(task, 'tickOff');

    // When
    const result = await useCase.execute({
      member,
      task,
    });
    const tickedOffTask: Task = result.value.getValue();

    // Then
    expect.assertions(4);
    expect(result.isRight()).toBe(true);
    expect(tickedOffTask.isTickedOff()).toBe(true);
    expect(tickOffSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();

    tickOffSpy.mockRestore();
    saveSpy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).build();

    // When
    const result = await useCase.execute({
      member,
      task,
    });
    const tickedOffTask: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(tickedOffTask.isTickedOff()).toBe(true);
  });
});
