import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { CommentRepository } from '../../../domain/comment/comment.repository';
import { MemberRepository } from '../../../domain/member.repository';
import { TaskId } from '../../../domain/task-id.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryCommentRepository } from '../../../repositories/comment/implementations/in-memory-comment.repository';
import { InMemoryMemberRepository } from '../../../repositories/member/implementations/in-memory-member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { CommentOnTaskDto } from './comment-on-task.dto';
import { CommentOnTaskErrors } from './comment-on-task.errors';
import { CommentOnTaskUsecase } from './comment-on-task.usecase';

describe('CommentOnTaskUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let commentRepository: CommentRepository;
  let useCase: CommentOnTaskUsecase;

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
        {
          provide: CommentRepository,
          useClass: InMemoryCommentRepository,
        },
        CommentOnTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    commentRepository = module.get<CommentRepository>(CommentRepository);
    useCase = module.get<CommentOnTaskUsecase>(CommentOnTaskUsecase);
  });

  it('should fail if task-id cannot be created', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const taskId = faker.random.uuid();
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const spy = jest
      .spyOn(TaskId, 'create')
      .mockReturnValue(Result.fail<TaskId>('error'));

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBeTruthy();

    spy.mockRestore();
  });

  it('should fail if task cannot be found', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const taskId = faker.random.uuid();
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      taskId,
      dto,
      member,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(CommentOnTaskErrors.TaskNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find a task by the id {${taskId}}.`,
    );
  });

  it('should fail while finding a task throws an error', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    const taskRepositorySpy = jest
      .spyOn(taskRepository, 'getTaskById')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    taskRepositorySpy.mockRestore();
  });

  it('should fail if comment text cannot be created', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: '',
    };
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBeTruthy();
  });

  it('should fail if member is not the task owner', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(
      CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError,
    );
    expect(result.value.errorValue().message).toEqual(
      `Member with id {${member.memberId}} is neither the task owner nor the assignee.`,
    );
  });

  it('should fail if member is not assignee', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const assignee = new MemberEntityBuilder().build();
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder()
      .withAssigneeId(assignee.assigneeId)
      .build();
    await memberRepository.save(assignee);
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(
      CommentOnTaskErrors.MemberIsNeitherTaskOwnerNorAssigneeError,
    );
    expect(result.value.errorValue().message).toEqual(
      `Member with id {${member.memberId}} is neither the task owner nor the assignee.`,
    );
  });

  it('should fail if the comment cannot be saved', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const spy = jest
      .spyOn(commentRepository, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    await memberRepository.save(member);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should add comment from task owner', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const owner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(owner.ownerId).build();
    await memberRepository.save(owner);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member: owner,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBeTruthy();
  });

  it('should add comment from assignee', async () => {
    // Given
    const dto: CommentOnTaskDto = {
      text: faker.lorem.sentence(),
    };
    const owner = new MemberEntityBuilder().build();
    const assignee = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder()
      .withOwnerId(owner.ownerId)
      .withAssigneeId(assignee.assigneeId)
      .build();
    await memberRepository.save(owner);
    await memberRepository.save(assignee);
    await taskRepository.save(task);

    // When
    const result = await useCase.execute({
      dto,
      member: assignee,
      taskId: task.taskId.toString(),
    });

    // Then
    expect.assertions(1);
    expect(result.isRight()).toBeTruthy();
  });
});
