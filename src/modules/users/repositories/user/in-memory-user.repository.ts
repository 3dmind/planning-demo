import { Injectable } from '@nestjs/common';
import { UniqueEntityId } from '../../../../shared/domain';
import { UserEmail } from '../../domain/user-email.valueobject';
import { UserName } from '../../domain/user-name.valueobject';
import { User } from '../../domain/user.entity';
import { MaybeUser, UserRepository } from './user.repository';

/**
 * In-memory implementation of the user repository.
 * Use for test purposes only!
 * @example
 * Test.createTestingModule({
 *   providers: [{
 *     provide: UserRepository,
 *     useClass: InMemoryUserRepository,
 *   }]
 * })
 */
@Injectable()
export class InMemoryUserRepository extends UserRepository {
  private readonly users = new Map<string, User>();

  constructor() {
    super();
  }

  public async exists(userEmail: UserEmail): Promise<boolean> {
    return this.users.has(userEmail.value);
  }

  public async getUserByUsername(userName: UserName): Promise<MaybeUser> {
    const user = this.toArray().find((u) => u.username.equals(userName));
    const found = !!user === true;

    if (found) {
      return {
        found,
        user,
      };
    } else {
      return {
        found,
      };
    }
  }

  public async getUserByUserId(id: UniqueEntityId): Promise<MaybeUser> {
    const user = this.toArray().find((u) => u.userId.id.equals(id));
    const found = !!user === true;

    if (found) {
      return {
        found,
        user,
      };
    } else {
      return {
        found,
      };
    }
  }

  public async save(user: User): Promise<void> {
    const exists = await this.exists(user.email);
    if (!exists) {
      this.users.set(user.email.value, user);
    }
  }

  private toArray(): User[] {
    return Array.from(this.users.values());
  }
}
