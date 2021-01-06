import { UniqueEntityId } from '../../../../shared/domain';
import { UserEmail } from '../../domain/user-email.valueobject';
import { UserName } from '../../domain/user-name.valueobject';
import { User } from '../../domain/user.entity';

export abstract class UserRepository {
  abstract async exists(userEmail: UserEmail): Promise<boolean>;

  abstract async getUserByUsername(
    userName: UserName,
  ): Promise<{
    found: boolean;
    user?: User;
  }>;

  abstract async getUserByUserId(
    id: UniqueEntityId,
  ): Promise<{
    found: boolean;
    user?: User;
  }>;

  abstract async save(user: User): Promise<void>;
}
