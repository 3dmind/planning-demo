import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '../../../../shared/domain';
import { Member } from '../../domain/member.entity';
import { MaybeMember, MemberRepository } from './member.repository';

/**
 * In-memory implementation of the member repository.
 * Use for test purposes only!
 * @example
 * Test.createTestingModule({
 *   providers: [{
 *     provide: MemberRepository,
 *     useClass: InMemoryMemberRepository,
 *   }]
 * })
 */
@Injectable()
export class InMemoryMemberRepository extends MemberRepository {
  private members = new Map<string, Member>();

  constructor() {
    super();
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    return this.members.has(id.toString());
  }

  public async getMemberByUserId(id: UniqueEntityId): Promise<MaybeMember> {
    const member = this.toArray().find((member) => member.userId.id.equals(id));
    const found = !!member === true;

    if (found) {
      return {
        found,
        member,
      };
    } else {
      return { found };
    }
  }

  public async save(member: Member): Promise<void> {
    const exists = await this.exists(member.userId.id);
    if (!exists) {
      this.members.set(member.memberId.id.toString(), member);
    }
  }

  private toArray(): Member[] {
    return Array.from(this.members.values());
  }
}
