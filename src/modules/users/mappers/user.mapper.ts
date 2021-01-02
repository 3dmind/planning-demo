import type { BaseUserModel, Prisma } from '@prisma/client';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from '../domain/user-email.valueobject';
import { UserName } from '../domain/user-name.valueobject';
import { UserPassword } from '../domain/user-password.valueobject';
import { User } from '../domain/user.entity';
import { UserDto } from '../dtos/user.dto';

export class UserMapper {
  public static async toPersistence(user: User): Promise<Prisma.BaseUserModelCreateInput> {
    const userSnapshot = user.createSnapshot();
    const password = userSnapshot.password;
    let hashedPassword;

    if (password.isAlreadyHashed()) {
      hashedPassword = password.value;
    } else {
      hashedPassword = await password.getHashedValue();
    }

    return {
      baseUserId: userSnapshot.userId.id.toString(),
      createdAt: userSnapshot.createdAt,
      isEmailVerified: userSnapshot.isEmailVerified,
      userEmail: userSnapshot.email.value,
      username: userSnapshot.username.value,
      userPassword: hashedPassword,
    };
  }

  public static toDomain(baseUserModel: BaseUserModel): User {
    const {
      baseUserId,
      createdAt,
      isEmailVerified,
      userEmail,
      username,
      userPassword,
    } = baseUserModel;
    const entityId = new UniqueEntityId(baseUserId);
    const userNameResult = UserName.create(username);
    const userPasswordResult = UserPassword.create({
      value: userPassword,
      hashed: true,
    });
    const userEmailResult = UserEmail.create(userEmail);
    const userEntityResult = User.create({
      createdAt,
      email: userEmailResult.getValue(),
      isEmailVerified: isEmailVerified,
      password: userPasswordResult.getValue(),
      username: userNameResult.getValue(),
    }, entityId);
    return userEntityResult.getValue();
  }

  public static toDto(user: User): UserDto {
    const {
      createdAt,
      email,
      isEmailVerified,
      username,
    } = user.createSnapshot();
    return {
      createdAt: createdAt.toISOString(),
      email: email.value,
      isEmailVerified: isEmailVerified,
      username: username.value,
    };
  }
}
