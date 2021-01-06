import { UniqueEntityId } from '../../../../shared/domain';
import { Member } from '../../domain/member.entity';

export abstract class MemberRepository {
  abstract async exists(id: UniqueEntityId): Promise<boolean>;
  abstract async getMemberByUserId(
    id: UniqueEntityId,
  ): Promise<{ found: boolean; member?: Member }>;
  abstract async save(member: Member): Promise<void>;
}
