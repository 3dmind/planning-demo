import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { DiscardTaskUseCase } from './discard-task.use-case';

describe('DiscardTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: DiscardTaskUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        DiscardTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<DiscardTaskUseCase>(DiscardTaskUseCase);
  });

  it('should fail if member is not the task owner', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();

    // When
    const result = await useCase.execute({ member, task });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ member, task });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not discard a task which is already discarded', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).makeDiscarded().build();
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const discardSpy = jest.spyOn(task, 'discard');

    // When
    const result = await useCase.execute({ member, task });
    const discardedTask: Task = result.value.getValue();

    // Then
    expect.assertions(4);
    expect(result.isRight()).toBe(true);
    expect(discardedTask.isDiscarded()).toBe(true);
    expect(discardSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();

    discardSpy.mockRestore();
    saveSpy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();

    // When
    const result = await useCase.execute({ member, task });
    const discardedTask: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(discardedTask.isDiscarded()).toBe(true);
  });
});
