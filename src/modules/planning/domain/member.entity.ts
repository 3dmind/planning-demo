import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { UserId } from '../../users/domain/user-id.entity';
import { MemberId } from './member-id.entity';
import { MemberProps } from './member-props.interface';
import { MemberSnapshot } from './member-snapshot';

export class Member extends Entity<MemberProps> {
  private constructor(props: MemberProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get memberId(): MemberId {
    return MemberId.create(this._id).getValue();
  }

  get userId(): UserId {
    return this.props.userId;
  }

  public static create(
    props: MemberProps,
    id?: UniqueEntityId,
  ): Result<Member> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      {
        argument: props.userId,
        argumentName: 'userId',
      },
    ]);

    if (!guardResult.succeeded) {
      return Result.fail<Member>(guardResult.message);
    }

    const member = new Member(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
    return Result.ok<Member>(member);
  }

  public createSnapshot(): MemberSnapshot {
    return new MemberSnapshot(this.props, this.memberId);
  }
}
