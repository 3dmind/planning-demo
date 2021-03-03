import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { InMemoryMemberRepository } from '../../../repositories/member/in-memory-member.repository';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { GetAllActiveTasksErrors } from './get-all-active-tasks.errors';
import { GetAllActiveTasksUsecase } from './get-all-active-tasks.usecase';

describe('GetAllActiveTasksUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: GetAllActiveTasksUsecase;

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
        GetAllActiveTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = await module.resolve<MemberRepository>(MemberRepository);
    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<GetAllActiveTasksUsecase>(
      GetAllActiveTasksUsecase,
    );
  });

  it('should fail if member cannot be found', async () => {
    expect.assertions(3);
    const userId = UserId.create(new UniqueEntityId()).getValue();

    const result = await useCase.execute({ userId });
    const error = <GetAllActiveTasksErrors.MemberNotFoundError>result.value;

    expect(result.isLeft()).toBe(true);
    expect(error).toBeInstanceOf(GetAllActiveTasksErrors.MemberNotFoundError);
    expect(error.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId.id}}.`,
    );
  });

  it('should fail on any error', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(taskRepository, 'getAllActiveTasksOfMember')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    const result = await useCase.execute({
      userId: member.userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(8);
    const memberOne = new MemberEntityBuilder().build();
    const memberTwo = new MemberEntityBuilder().build();
    const notedTaskOfMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .build();
    const tickedOffTaskOfMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .makeTickedOff()
      .build();
    const archivedTaskOfMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .makeArchived()
      .build();
    const discardedTaskOfMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .makeDiscarded()
      .build();
    const notedTaskOfMemberTwo = new TaskEntityBuilder()
      .withOwnerId(memberTwo.ownerId)
      .build();
    const taskAssignedToMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberTwo.ownerId)
      .withAssigneeId(memberOne.assigneeId)
      .build();
    const taskAssignedToMemberTwo = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .withAssigneeId(memberTwo.assigneeId)
      .build();
    await memberRepository.save(memberOne);
    await memberRepository.save(memberTwo);
    await taskRepository.save(notedTaskOfMemberOne);
    await taskRepository.save(tickedOffTaskOfMemberOne);
    await taskRepository.save(archivedTaskOfMemberOne);
    await taskRepository.save(discardedTaskOfMemberOne);
    await taskRepository.save(notedTaskOfMemberTwo);
    await taskRepository.save(taskAssignedToMemberOne);
    await taskRepository.save(taskAssignedToMemberTwo);

    const result = await useCase.execute({
      userId: memberOne.userId,
    });
    const tasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(tasks).toContain(notedTaskOfMemberOne);
    expect(tasks).toContain(tickedOffTaskOfMemberOne);
    expect(tasks).toContain(taskAssignedToMemberOne);
    expect(tasks).toContain(taskAssignedToMemberTwo);
    expect(tasks).not.toContain(archivedTaskOfMemberOne);
    expect(tasks).not.toContain(discardedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberTwo);
  });
});
