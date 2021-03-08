import { Member } from '../../src/modules/planning/domain/member.entity';
import { UserId } from '../../src/modules/users/domain/user-id.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class MemberEntityBuilder {
  private createdAt: Date;
  private id: UniqueEntityId;
  private userId: UserId;

  constructor() {
    // TODO: Inline variables
    const createdAt = new Date();
    const entityId = new UniqueEntityId();
    const userId = UserId.create().getValue();

    this.createdAt = createdAt;
    this.id = entityId;
    this.userId = userId;
  }

  withCreationDate(createdAt: Date): MemberEntityBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withId(id: UniqueEntityId): MemberEntityBuilder {
    this.id = id;
    return this;
  }

  withUserId(userId: UserId): MemberEntityBuilder {
    this.userId = userId;
    return this;
  }

  build(): Member {
    return Member.create(
      {
        createdAt: this.createdAt,
        userId: this.userId,
      },
      this.id,
    ).getValue();
  }
}
