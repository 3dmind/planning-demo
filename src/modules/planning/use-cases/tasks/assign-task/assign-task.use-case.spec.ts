import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { MemberRepository } from '../../../domain/member.repository';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryMemberRepository } from '../../../repositories/member/implementations/in-memory-member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { AssignTaskErrors } from './assign-task.errors';
import { AssignTaskUseCase } from './assign-task.use-case';

describe('AssignTaskUseCase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: AssignTaskUseCase;

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
        AssignTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<AssignTaskUseCase>(AssignTaskUseCase);
  });

  it('should fail if assignee cannot be found', async () => {
    // Given
    const assigner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(assigner.ownerId).build();
    const assignee = new MemberEntityBuilder().build();

    // When
    const result = await useCase.execute({
      assigner,
      memberId: assignee.memberId.toString(),
      task,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AssignTaskErrors.MemberNotFoundError);
    expect(result.value.errorValue().message).toEqual(`Could not find member by the id {${assignee.memberId}}.`);
  });

  it('should fail if the assigner is not the task owner', async () => {
    // Given
    const assigner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(assigner.ownerId).build();
    const member = new MemberEntityBuilder().build();
    const assignee = new MemberEntityBuilder().build();
    await memberRepository.save(assignee);

    // When
    const result = await useCase.execute({
      assigner: member,
      memberId: assignee.memberId.toString(),
      task,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const assigner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(assigner.ownerId).build();
    const assignee = new MemberEntityBuilder().build();
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });
    await memberRepository.save(assignee);

    // When
    const result = await useCase.execute({
      assigner,
      memberId: assignee.memberId.toString(),
      task,
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not assign a task which is already assigned to the member', async () => {
    // Given
    const assigner = new MemberEntityBuilder().build();
    const assignee = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(assigner.ownerId).withAssigneeId(assignee.assigneeId).build();
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const assignSpy = jest.spyOn(task, 'assign');
    await memberRepository.save(assignee);

    // When
    const result = await useCase.execute({
      assigner,
      memberId: assignee.memberId.toString(),
      task,
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
    const assigner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(assigner.ownerId).build();
    const assignee = new MemberEntityBuilder().build();
    await memberRepository.save(assignee);

    // When
    const result = await useCase.execute({
      assigner,
      memberId: assignee.memberId.toString(),
      task,
    });

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBe(true);
  });
});
