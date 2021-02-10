import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { InMemoryMemberRepository } from '../../../repositories/member/in-memory-member.repository';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { AssignTaskErrors } from './assign-task.errors';
import { AssignTaskUsecase } from './assign-task.usecase';

describe('AssignTaskUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: AssignTaskUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        AssignTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = await module.resolve<MemberRepository>(MemberRepository);
    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<AssignTaskUsecase>(AssignTaskUsecase);
  });

  it('should fail if an associated member cannot be found', async () => {
    expect.assertions(3);
    const memberId = faker.random.uuid();
    const taskId = faker.random.uuid();
    const userId = UserId.create(new UniqueEntityId()).getValue();

    const result = await useCase.execute({
      memberId,
      taskId,
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      AssignTaskErrors.MemberNotFoundByUserIdError,
    );
    expect(result.value.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId.id}}.`,
    );
  });

  it('should fail if member cannot be found', async () => {
    expect.assertions(3);
    const taskId = faker.random.uuid();
    const memberId = faker.random.uuid();
    const taskOwner = new MemberEntityBuilder().build();
    await memberRepository.save(taskOwner);

    const result = await useCase.execute({
      memberId,
      userId: taskOwner.userId,
      taskId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AssignTaskErrors.MemberNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find member by the id {${memberId}}.`,
    );
  });

  it('should fail if task cannot be found', async () => {
    expect.assertions(3);
    const taskId = faker.random.uuid();
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);

    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AssignTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail if the task is already assigned to the member', async () => {
    expect.assertions(1);
    const member = new MemberEntityBuilder().build();
    const owner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder()
      .withOwnerId(owner.ownerId)
      .withAssigneeId(member.assigneeId)
      .build();
    await memberRepository.save(owner);
    await memberRepository.save(member);
    await taskRepository.save(task);

    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      taskId: task.taskId.id.toString(),
      userId: owner.userId,
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(taskRepository, 'getTaskOfOwnerByTaskId')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);
    await taskRepository.save(task);

    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId: task.taskId.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(1);
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);
    await taskRepository.save(task);

    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId: task.taskId.id.toString(),
    });

    expect(result.isRight()).toBe(true);
  });
});
