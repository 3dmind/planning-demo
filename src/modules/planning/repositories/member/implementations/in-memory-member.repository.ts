import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '../../../../../shared/domain';
import { MemberId } from '../../../domain/member-id.entity';
import { Member } from '../../../domain/member.entity';
import { MaybeMember, MemberRepository } from '../../../domain/member.repository';

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
  private readonly members = new Map<string, Member>();

  constructor() {
    super();
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    return this.members.has(id.toString());
  }

  public async getMemberById(memberId: MemberId): Promise<MaybeMember> {
    const exists = await this.exists(memberId.id);
    if (!exists) {
      return {
        found: false,
      };
    } else {
      const member = this.members.get(memberId.toString());
      return {
        found: true,
        member,
      };
    }
  }

  public async getMemberByUserId(id: UniqueEntityId): Promise<MaybeMember> {
    const member = this.toArray().find((m) => m.userId.id.equals(id));
    const found = !!member === true;

    if (found) {
      return {
        found,
        member,
      };
    } else {
      return {
        found,
      };
    }
  }

  public async save(member: Member): Promise<void> {
    this.members.set(member.memberId.toString(), member);
  }

  private toArray(): Member[] {
    return Array.from(this.members.values());
  }
}
