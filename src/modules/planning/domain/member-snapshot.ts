import { UserId } from '../../users/domain/user-id.entity';
import { MemberId } from './member-id.entity';
import { MemberProps } from './member-props.interface';

export class MemberSnapshot {
  readonly createdAt: Date;
  readonly memberId: MemberId;
  readonly userId: UserId;

  constructor(props: Readonly<MemberProps>, memberId: MemberId) {
    const { createdAt, userId } = props;
    this.createdAt = createdAt;
    this.memberId = memberId;
    this.userId = userId;

    Object.freeze(this);
  }
}
