import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from './user-email.valueobject';
import { UserName } from './user-name.valueobject';
import { User } from './user.entity';

export type MaybeUser = {
  found: boolean;
  user?: User;
};

export abstract class UserRepository {
  abstract exists(userEmail: UserEmail): Promise<boolean>;

  abstract getUserByUsername(userName: UserName): Promise<MaybeUser>;

  abstract getUserByUserId(id: UniqueEntityId): Promise<MaybeUser>;

  abstract save(user: User): Promise<void>;
}
