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
      .spyOn(taskRepository, 'getAllActiveTasksOfOwnerByOwnerId')
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
    const member1 = new MemberEntityBuilder().build();
    const member2 = new MemberEntityBuilder().build();
    const notedTaskOfMember1 = new TaskEntityBuilder()
      .withOwnerId(member1.ownerId)
      .build();
    const tickedOffTaskOfMember1 = new TaskEntityBuilder()
      .withOwnerId(member1.ownerId)
      .makeTickedOff()
      .build();
    const archivedTaskOfMember1 = new TaskEntityBuilder()
      .withOwnerId(member1.ownerId)
      .makeArchived()
      .build();
    const discardedTaskOfMember1 = new TaskEntityBuilder()
      .withOwnerId(member1.ownerId)
      .makeDiscarded()
      .build();
    const notedTaskOfMember2 = new TaskEntityBuilder()
      .withOwnerId(member2.ownerId)
      .build();
    await memberRepository.save(member1);
    await memberRepository.save(member2);
    await taskRepository.save(notedTaskOfMember1);
    await taskRepository.save(tickedOffTaskOfMember1);
    await taskRepository.save(archivedTaskOfMember1);
    await taskRepository.save(discardedTaskOfMember1);
    await taskRepository.save(notedTaskOfMember2);

    const result = await useCase.execute({
      userId: member1.userId,
    });
    const tasks = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(tasks).toContain(notedTaskOfMember1);
    expect(tasks).toContain(tickedOffTaskOfMember1);
    expect(tasks).not.toContain(archivedTaskOfMember1);
    expect(tasks).not.toContain(discardedTaskOfMember1);
    expect(tasks).not.toContain(notedTaskOfMember2);
  });
});
