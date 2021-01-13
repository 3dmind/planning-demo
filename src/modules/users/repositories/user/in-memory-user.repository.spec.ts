import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { InMemoryUserRepository } from './in-memory-user.repository';

describe('InMemoryUserRepository', () => {
  it('should save user', async () => {
    expect.assertions(1);
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();

    await expect(repository.save(user)).resolves.not.toThrow();
  });

  it('should find stored user by username', async () => {
    expect.assertions(2);
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();
    await repository.save(user);

    const result = await repository.getUserByUsername(user.username);

    expect(result.found).toBe(true);
    expect(result.user.equals(user)).toBe(true);
  });

  it('should find stored user by user id', async () => {
    expect.assertions(2);
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();
    await repository.save(user);

    const result = await repository.getUserByUserId(user.id);

    expect(result.found).toBe(true);
    expect(result.user.equals(user)).toBe(true);
  });
});
