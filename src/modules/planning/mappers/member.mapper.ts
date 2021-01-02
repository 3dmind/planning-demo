import { MemberModel, Prisma } from '@prisma/client';
import { UniqueEntityId } from '../../../shared/domain';
import { UserId } from '../../users/domain/user-id.entity';
import { Member } from '../domain/member.entity';

export class MemberMapper {
  public static toPersistence(member: Member): Prisma.MemberModelCreateInput {
    const memberSnapshot = member.createSnapshot();
    return {
      createdAt: memberSnapshot.createdAt,
      memberId: memberSnapshot.memberId.id.toString(),
      baseUserModel: {
        connect: {
          baseUserId: memberSnapshot.userId.id.toString(),
        },
      },
    };
  }

  public static toDomain(memberModel: MemberModel): Member {
    const entityId = new UniqueEntityId(memberModel.memberId);
    const userId = UserId.create(
      new UniqueEntityId(memberModel.memberBaseId),
    ).getValue();

    return Member.create(
      {
        createdAt: memberModel.createdAt,
        userId,
      },
      entityId,
    ).getValue();
  }
}
