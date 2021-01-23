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

  it('should get a task of a particular owner', async () => {
    expect.assertions(3);
    const member1 = new MemberEntityBuilder().build();
    const member2 = new MemberEntityBuilder().build();
    const task1 = new TaskEntityBuilder().withOwnerId(member1.ownerId).build();
    const task2 = new TaskEntityBuilder().withOwnerId(member2.ownerId).build();
    const repository = new InMemoryTaskRepository();
    await repository.save(task1);
    await repository.save(task2);

    const maybeTask = await repository.getTaskOfOwnerByTaskId(
      member1.ownerId,
      task1.taskId,
    );

    expect(maybeTask.found).toBe(true);
    expect(maybeTask.task.ownerId.equals(member1.ownerId)).toBe(true);
    expect(maybeTask.task.taskId.equals(task1.taskId)).toBe(true);
  });

  it('should get all stored tasks', async () => {
    expect.assertions(3);
    const repository = new InMemoryTaskRepository();
    const task1 = new TaskEntityBuilder().build();
    const task2 = new TaskEntityBuilder().build();
    await repository.save(task1);
    await repository.save(task2);

    const tasks = await repository.getTasks();

    expect(tasks).toHaveLength(2);
    expect(tasks).toContain(task1);
    expect(tasks).toContain(task2);
  });

  it('should find all archived tasks', async () => {
    expect.assertions(3);
    const repository = new InMemoryTaskRepository();
    const archivedTask = new TaskEntityBuilder().makeArchived().build();
    const discardedTask = new TaskEntityBuilder().makeDiscarded().build();
    await repository.save(archivedTask);
    await repository.save(discardedTask);

    const tasks = await repository.getArchivedTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks).toContain(archivedTask);
    expect(tasks).not.toContain(discardedTask);
  });

  it('should find all active tasks of a particular owner', async () => {
    expect.assertions(5);
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
    const repository = new InMemoryTaskRepository();
    await repository.save(notedTaskOfMember1);
    await repository.save(tickedOffTaskOfMember1);
    await repository.save(archivedTaskOfMember1);
    await repository.save(discardedTaskOfMember1);
    await repository.save(notedTaskOfMember2);

    const tasks = await repository.getAllActiveTasksOfOwnerByOwnerId(
      member1.ownerId,
    );

    expect(tasks).toContain(notedTaskOfMember1);
    expect(tasks).toContain(tickedOffTaskOfMember1);
    expect(tasks).not.toContain(archivedTaskOfMember1);
    expect(tasks).not.toContain(discardedTaskOfMember1);
    expect(tasks).not.toContain(notedTaskOfMember2);
  });
});
