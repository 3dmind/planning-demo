import { UniqueEntityId } from '../../../../shared/domain';
import { Member } from '../../domain/member.entity';

export type MaybeMember = {
  found: boolean;
  member?: Member;
};

export abstract class MemberRepository {
  abstract exists(id: UniqueEntityId): Promise<boolean>;

  abstract getMemberByUserId(id: UniqueEntityId): Promise<MaybeMember>;

  abstract save(member: Member): Promise<void>;
}
