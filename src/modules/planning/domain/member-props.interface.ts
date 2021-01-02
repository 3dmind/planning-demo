import { UserId } from '../../users/domain/user-id.entity';

export interface MemberProps {
  userId: UserId;
  createdAt?: Date;
}
