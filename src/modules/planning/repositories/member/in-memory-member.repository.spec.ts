import { UserId } from '../../../users/domain/user-id.entity';
import { Member } from '../../domain/member.entity';
import { InMemoryMemberRepository } from './in-memory-member.repository';

describe('InMemoryMemberRepository', () => {
  it('should save member', async () => {
    expect.assertions(1);
    const repository = new InMemoryMemberRepository();
    const member = Member.create({
      userId: UserId.create().getValue(),
    }).getValue();

    await expect(repository.save(member)).resolves.not.toThrow();
  });

  it('should find stored member by user id ', async () => {
    expect.assertions(2);
    const repository = new InMemoryMemberRepository();
    const userId = UserId.create().getValue();
    const member = Member.create({ userId }).getValue();
    await repository.save(member);

    const result = await repository.getMemberByUserId(userId.id);

    expect(result.found).toBe(true);
    expect(result.member.equals(member)).toBe(true);
  });
});
