import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { InMemoryTaskRepository } from './in-memory-task.repository';

describe('InMemoryTaskRepository', () => {
  it('should save task', async () => {
    expect.assertions(1);
    const repository = new InMemoryTaskRepository();
    const task = new TaskEntityBuilder().build();

    await expect(repository.save(task)).resolves.not.toThrow();
  });

  it('should find task by its id', async () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().build();
    const repository = new InMemoryTaskRepository();
    await repository.save(task);

    const maybeTask = await repository.getTaskById(task.taskId);

    expect(maybeTask.found).toBe(true);
  });

  it('should find all archived task of a particular member', async () => {
    expect.assertions(4);
    const memberOne = new MemberEntityBuilder().build();
    const memberTwo = new MemberEntityBuilder().build();
    const notedTaskOfMemberOne = new TaskEntityBuilder()
      .withOwnerId(memberOne.ownerId)
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
    const repository = new InMemoryTaskRepository();
    await repository.save(notedTaskOfMemberOne);
    await repository.save(archivedTaskOfMemberOne);
    await repository.save(discardedTaskOfMemberOne);
    await repository.save(notedTaskOfMemberTwo);

    const tasks = await repository.getAllArchivedTasksOfMember(
      memberOne.memberId,
    );

    expect(tasks).toContain(archivedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberOne);
    expect(tasks).not.toContain(discardedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberTwo);
  });

  it('should find all active tasks of a particular member', async () => {
    expect.assertions(7);
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
    const repository = new InMemoryTaskRepository();
    await repository.save(notedTaskOfMemberOne);
    await repository.save(tickedOffTaskOfMemberOne);
    await repository.save(archivedTaskOfMemberOne);
    await repository.save(discardedTaskOfMemberOne);
    await repository.save(notedTaskOfMemberTwo);
    await repository.save(taskAssignedToMemberOne);
    await repository.save(taskAssignedToMemberTwo);

    const tasks = await repository.getAllActiveTasksOfMember(
      memberOne.memberId,
    );

    expect(tasks).toContain(notedTaskOfMemberOne);
    expect(tasks).toContain(tickedOffTaskOfMemberOne);
    expect(tasks).toContain(taskAssignedToMemberOne);
    expect(tasks).toContain(taskAssignedToMemberTwo);
    expect(tasks).not.toContain(archivedTaskOfMemberOne);
    expect(tasks).not.toContain(discardedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberTwo);
  });
});
