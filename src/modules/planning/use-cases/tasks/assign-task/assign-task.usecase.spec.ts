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

  beforeAll(async () => {
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

    memberRepository = module.get<MemberRepository>(MemberRepository);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<AssignTaskUsecase>(AssignTaskUsecase);
  });

  it('should fail if an associated member cannot be found', async () => {
    // Given
    const memberId = faker.random.uuid();
    const taskId = faker.random.uuid();
    const userId = UserId.create(new UniqueEntityId()).getValue();

    // When
    const result = await useCase.execute({
      memberId,
      taskId,
      userId,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      AssignTaskErrors.MemberNotFoundByUserIdError,
    );
    expect(result.value.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId}}.`,
    );
  });

  it('should fail if member cannot be found', async () => {
    // Given
    const taskId = faker.random.uuid();
    const memberId = faker.random.uuid();
    const taskOwner = new MemberEntityBuilder().build();
    await memberRepository.save(taskOwner);

    // When
    const result = await useCase.execute({
      memberId,
      userId: taskOwner.userId,
      taskId,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AssignTaskErrors.MemberNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find member by the id {${memberId}}.`,
    );
  });

  it('should fail if task cannot be found', async () => {
    // Given
    const taskId = faker.random.uuid();
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AssignTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail if the assigner is not the task owner', async () => {
    // Given
    const user = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const owner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(owner.ownerId).build();
    await memberRepository.save(user);
    await memberRepository.save(member);
    await memberRepository.save(owner);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      taskId: task.taskId.toString(),
      userId: user.userId,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest
      .spyOn(taskRepository, 'getTaskById')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not assign a task which is already assigned to the member', async () => {
    // Given
    const owner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder()
      .withOwnerId(owner.ownerId)
      .withAssigneeId(member.assigneeId)
      .build();
    await memberRepository.save(owner);
    await memberRepository.save(member);
    await taskRepository.save(task);
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const assignSpy = jest.spyOn(task, 'assign');

    // When
    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      taskId: task.taskId.toString(),
      userId: owner.userId,
    });

    // Then
    expect.assertions(3);
    expect(result.isRight()).toBe(true);
    expect(assignSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();

    assignSpy.mockRestore();
    saveSpy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const taskOwner = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    await memberRepository.save(taskOwner);
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      memberId: member.memberId.toString(),
      userId: taskOwner.userId,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBe(true);
  });
});
