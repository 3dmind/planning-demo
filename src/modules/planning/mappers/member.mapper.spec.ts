import { MemberModel, Prisma } from '@prisma/client';
import * as faker from 'faker';
import { UserId } from '../../users/domain/user-id.entity';
import { Member } from '../domain/member.entity';
import { MemberMapper } from './member.mapper';

describe('MemberMapper', () => {
  it('should map Entity to Model', () => {
    // Given
    const userId = UserId.create().getValue();
    const member = Member.create({ userId }).getValue();

    // When
    const memberModel = MemberMapper.toPersistence(member);

    // Then
    expect.assertions(1);
    expect(memberModel).toMatchObject<Prisma.MemberModelCreateInput>({
      createdAt: expect.any(Date),
      memberId: expect.any(String),
      baseUserModel: {
        connect: {
          baseUserId: expect.any(String),
        },
      },
    });
  });

  it('should map Model to Entity', () => {
    // Given
    const mockedUserId = faker.random.uuid();
    const mockedMemberId = faker.random.uuid();
    const mockedDate = new Date();
    const mockedMemberModel: MemberModel = {
      createdAt: mockedDate,
      memberBaseId: mockedUserId,
      memberId: mockedMemberId,
      updatedAt: mockedDate,
    };

    // When
    const member = MemberMapper.toDomain(mockedMemberModel);

    // Then
    expect.assertions(2);
    expect(member).toBeDefined();
    expect(member).toBeInstanceOf(Member);
  });
});
