import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { InMemoryMemberRepository } from '../../../repositories/member/in-memory-member.repository';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { DiscardTaskErrors } from './discard-task.errors';
import { DiscardTaskUsecase } from './discard-task.usecase';

describe('DiscardTaskUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: DiscardTaskUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        DiscardTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = await module.resolve<MemberRepository>(MemberRepository);
    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<DiscardTaskUsecase>(DiscardTaskUsecase);
  });

  it('should fail if task-id cannot be created', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));
    const userId = UserId.create(new UniqueEntityId()).getValue();

    const result = await useCase.execute({
      taskId: null,
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toEqual('error');

    spy.mockRestore();
  });

  it('should fail if member cannot be found', async () => {
    expect.assertions(3);
    const taskId = faker.random.uuid();
    const userId = UserId.create(new UniqueEntityId()).getValue();

    const result = await useCase.execute({
      taskId,
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DiscardTaskErrors.MemberNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId.id}}.`,
    );
  });

  it('should fail if a task cannot be found', async () => {
    expect.assertions(3);
    const taskId = faker.random.uuid();
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    const result = await useCase.execute({
      taskId,
      userId: member.userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DiscardTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail if member is not the task owner', async () => {
    expect.assertions(1);
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    await memberRepository.save(member);
    await taskRepository.save(task);

    const result = await useCase.execute({
      taskId: task.taskId.toString(),
      userId: member.userId,
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(taskRepository, 'getTaskById')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const taskId = faker.random.uuid();
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    const result = await useCase.execute({
      taskId,
      userId: member.userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(2);
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    await memberRepository.save(member);
    await taskRepository.save(task);

    const result = await useCase.execute({
      taskId: task.taskId.id.toString(),
      userId: member.userId,
    });
    const discardedTask: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(discardedTask.isDiscarded()).toBe(true);
  });
});
