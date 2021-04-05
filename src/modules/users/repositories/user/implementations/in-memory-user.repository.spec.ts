import { UserEntityBuilder } from '../../../../../../test/builder/user-entity.builder';
import { InMemoryUserRepository } from './in-memory-user.repository';

describe('InMemoryUserRepository', () => {
  it('should save user', async () => {
    // Given
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();

    // When
    const promise = repository.save(user);

    // Then
    expect.assertions(1);
    await expect(promise).resolves.not.toThrow();
  });

  it('should find stored user by username', async () => {
    // Given
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();
    await repository.save(user);

    // When
    const result = await repository.getUserByUsername(user.username);

    // Then
    expect.assertions(2);
    expect(result.found).toBe(true);
    expect(result.user.equals(user)).toBe(true);
  });

  it('should find stored user by user id', async () => {
    // Given
    const repository = new InMemoryUserRepository();
    const user = new UserEntityBuilder().build();
    await repository.save(user);

    // When
    const result = await repository.getUserByUserId(user.id);

    // Then
    expect.assertions(2);
    expect(result.found).toBe(true);
    expect(result.user.equals(user)).toBe(true);
  });
});
