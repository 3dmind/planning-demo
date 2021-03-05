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
import { GetAllArchivedTasksErrors } from './get-all-archived-tasks.errors';
import { GetAllArchivedTasksUsecase } from './get-all-archived-tasks.usecase';

describe('GetAllArchivedTasksUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: GetAllArchivedTasksUsecase;

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
        GetAllArchivedTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = await module.resolve<MemberRepository>(MemberRepository);
    taskRepository = await module.resolve<TaskRepository>(TaskRepository);
    useCase = await module.resolve<GetAllArchivedTasksUsecase>(
      GetAllArchivedTasksUsecase,
    );
  });

  it('should fail if member cannot be found', async () => {
    expect.assertions(3);
    const userId = UserId.create(new UniqueEntityId()).getValue();

    const result = await useCase.execute({ userId });
    const error = <GetAllArchivedTasksErrors.MemberNotFoundError>result.value;

    expect(result.isLeft()).toBe(true);
    expect(error).toBeInstanceOf(GetAllArchivedTasksErrors.MemberNotFoundError);
    expect(error.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId.id}}.`,
    );
  });

  it('should fail on any error', async () => {
    expect.assertions(2);
    const spy = jest
      .spyOn(taskRepository, 'getAllArchivedTasksOfMember')
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
    expect.assertions(6);
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
    await memberRepository.save(memberOne);
    await memberRepository.save(memberTwo);
    await taskRepository.save(notedTaskOfMemberOne);
    await taskRepository.save(tickedOffTaskOfMemberOne);
    await taskRepository.save(archivedTaskOfMemberOne);
    await taskRepository.save(discardedTaskOfMemberOne);
    await taskRepository.save(notedTaskOfMemberTwo);

    const result = await useCase.execute({
      userId: memberOne.userId,
    });
    const tasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(tasks).toContain(archivedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberOne);
    expect(tasks).not.toContain(tickedOffTaskOfMemberOne);
    expect(tasks).not.toContain(discardedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberTwo);
  });
});
