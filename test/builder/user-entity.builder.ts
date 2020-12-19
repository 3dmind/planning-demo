import * as faker from 'faker';
import { AccessToken, RefreshToken } from '../../src/modules/users/domain/jwt';
import { UserEmailValueObject } from '../../src/modules/users/domain/user-email.value-object';
import { UserNameValueObject } from '../../src/modules/users/domain/user-name.value-object';
import { UserPasswordValueObject } from '../../src/modules/users/domain/user-password.value-object';
import { UserEntity } from '../../src/modules/users/domain/user.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class UserEntityBuilder {
  private accessToken: AccessToken;
  private readonly createdAt: Date;
  private readonly id: UniqueEntityId;
  private email: UserEmailValueObject;
  private isEmailVerified: boolean;
  private password: UserPasswordValueObject;
  private refreshToken: RefreshToken;
  private username: UserNameValueObject;

  constructor(
    {
      createdAt = new Date(),
      email = faker.internet.email(),
      password = faker.internet.password(6),
      username = faker.internet.userName(),
      isEmailVerified = false,
    }: {
      createdAt?: Date;
      email?: string;
      password?: string;
      username?: string;
      isEmailVerified?: boolean;
    } = {},
    id: string = faker.random.uuid(),
  ) {
    this.accessToken = '';
    this.createdAt = createdAt;
    this.email = UserEmailValueObject.create(email).getValue();
    this.id = new UniqueEntityId(id);
    this.isEmailVerified = isEmailVerified;
    this.password = UserPasswordValueObject.create({
      value: password,
    }).getValue();
    this.refreshToken = '';
    this.username = UserNameValueObject.create(username).getValue();
  }

  makeEmailVerified(): UserEntityBuilder {
    this.isEmailVerified = true;
    return this;
  }

  makeLoggedIn(): UserEntityBuilder {
    this.accessToken = faker.random.alphaNumeric(20);
    this.refreshToken = faker.random.alphaNumeric(20);
    return this;
  }

  public build(): UserEntity {
    return UserEntity.create(
      {
        accessToken: this.accessToken,
        createdAt: this.createdAt,
        email: this.email,
        isEmailVerified: this.isEmailVerified,
        password: this.password,
        refreshToken: this.refreshToken,
        username: this.username,
      },
      this.id,
    ).getValue();
  }
}
