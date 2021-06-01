import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { GetAllActiveTasksUseCase } from './get-all-active-tasks.use-case';

describe('GetAllActiveTasksUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: GetAllActiveTasksUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetAllActiveTasksUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<GetAllActiveTasksUseCase>(GetAllActiveTasksUseCase);
  });

  it('should fail on any error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const spy = jest.spyOn(taskRepository, 'getAllActiveTasksOfMember').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ member });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const memberOne = new MemberEntityBuilder().build();
    const memberTwo = new MemberEntityBuilder().build();
    const notedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).build();
    const tickedOffTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeTickedOff().build();
    const archivedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeArchived().build();
    const discardedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeDiscarded().build();
    const notedTaskOfMemberTwo = new TaskEntityBuilder().withOwnerId(memberTwo.ownerId).build();
    const taskAssignedToMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberTwo.ownerId)
      .withAssigneeId(memberOne.assigneeId)
      .build();
    const taskAssignedToMemberTwo = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
      .withAssigneeId(memberTwo.assigneeId)
      .build();
    await taskRepository.save(notedTaskOfMemberOne);
    await taskRepository.save(tickedOffTaskOfMemberOne);
    await taskRepository.save(archivedTaskOfMemberOne);
    await taskRepository.save(discardedTaskOfMemberOne);
    await taskRepository.save(notedTaskOfMemberTwo);
    await taskRepository.save(taskAssignedToMemberOne);
    await taskRepository.save(taskAssignedToMemberTwo);

    // When
    const result = await useCase.execute({
      member: memberOne,
    });
    const tasks = result.value.getValue();

    // Then
    expect.assertions(8);
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
