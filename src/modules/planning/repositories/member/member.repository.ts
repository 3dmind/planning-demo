import { UniqueEntityId } from '../../../../shared/domain';
import { Member } from '../../domain/member.entity';

export type MaybeMember = {
  found: boolean;
  member?: Member;
};

export abstract class MemberRepository {
  abstract async exists(id: UniqueEntityId): Promise<boolean>;

  abstract async getMemberByUserId(id: UniqueEntityId): Promise<MaybeMember>;

  abstract async save(member: Member): Promise<void>;
}
