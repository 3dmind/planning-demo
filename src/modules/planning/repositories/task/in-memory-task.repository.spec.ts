import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { InMemoryTaskRepository } from './in-memory-task.repository';

describe('InMemoryTaskRepository', () => {
  it('should save task', async () => {
    expect.assertions(1);
    const repository = new InMemoryTaskRepository();
    const task = new TaskEntityBuilder().build();

    await expect(repository.save(task)).resolves.not.toThrow();
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

  it('should find stored task by task id', async () => {
    expect.assertions(2);
    const repository = new InMemoryTaskRepository();
    const task = new TaskEntityBuilder().build();
    await repository.save(task);

    const result = await repository.getTaskByTaskId(task.taskId);

    expect(result.found).toBe(true);
    expect(result.task.equals(task)).toBe(true);
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

  it('should find active tasks', async () => {
    expect.assertions(4);
    const repository = new InMemoryTaskRepository();
    const notedTask = new TaskEntityBuilder().build();
    const tickedOffTask = new TaskEntityBuilder().makeTickedOff().build();
    const archivedTask = new TaskEntityBuilder().makeArchived().build();
    const discardedTask = new TaskEntityBuilder().makeDiscarded().build();
    await repository.save(notedTask);
    await repository.save(tickedOffTask);
    await repository.save(archivedTask);
    await repository.save(discardedTask);

    const tasks = await repository.getActiveTasks();

    expect(tasks).toContain(notedTask);
    expect(tasks).toContain(tickedOffTask);
    expect(tasks).not.toContain(archivedTask);
    expect(tasks).not.toContain(discardedTask);
  });
});
