import { UserId } from '../../../users/domain/user-id.entity';
import { Member } from '../../domain/member.entity';
import { InMemoryMemberRepository } from './in-memory-member.repository';

describe('InMemoryMemberRepository', () => {
  it('should save member', async () => {
    // Given
    const repository = new InMemoryMemberRepository();
    const member = Member.create({
      userId: UserId.create().getValue(),
    }).getValue();

    // When
    const promise = repository.save(member);

    // Then
    expect.assertions(1);
    await expect(promise).resolves.not.toThrow();
  });

  it('should find stored member by id', async () => {
    // Given
    const repository = new InMemoryMemberRepository();
    const userId = UserId.create().getValue();
    const member = Member.create({ userId }).getValue();
    await repository.save(member);

    // When
    const result = await repository.getMemberById(member.memberId);

    // Then
    expect.assertions(2);
    expect(result.found).toBe(true);
    expect(result.member.equals(member)).toBe(true);
  });

  it('should find stored member by user id ', async () => {
    // Given
    const repository = new InMemoryMemberRepository();
    const userId = UserId.create().getValue();
    const member = Member.create({ userId }).getValue();
    await repository.save(member);

    // When
    const result = await repository.getMemberByUserId(userId.id);

    // Then
    expect.assertions(2);
    expect(result.found).toBe(true);
    expect(result.member.equals(member)).toBe(true);
  });
});
