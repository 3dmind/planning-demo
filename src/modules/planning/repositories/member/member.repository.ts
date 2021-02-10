import { UniqueEntityId } from '../../../../shared/domain';
import { MemberId } from '../../domain/member-id.entity';
import { Member } from '../../domain/member.entity';

export type MaybeMember = {
  found: boolean;
  member?: Member;
};

export abstract class MemberRepository {
  abstract exists(id: UniqueEntityId): Promise<boolean>;

  abstract getMemberById(memberId: MemberId): Promise<MaybeMember>;

  abstract getMemberByUserId(id: UniqueEntityId): Promise<MaybeMember>;

  abstract save(member: Member): Promise<void>;
}
