import * as faker from 'faker';
import { AccessToken, RefreshToken } from '../../src/modules/users/domain/jwt';
import { UserEmail } from '../../src/modules/users/domain/user-email.valueobject';
import { UserName } from '../../src/modules/users/domain/user-name.valueobject';
import { UserPassword } from '../../src/modules/users/domain/user-password.valueobject';
import { UserEntity } from '../../src/modules/users/domain/user.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class UserEntityBuilder {
  private accessToken: AccessToken;
  private readonly createdAt: Date;
  private readonly id: UniqueEntityId;
  private email: UserEmail;
  private isEmailVerified: boolean;
  private password: UserPassword;
  private refreshToken: RefreshToken;
  private username: UserName;

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
    this.email = UserEmail.create(email).getValue();
    this.id = new UniqueEntityId(id);
    this.isEmailVerified = isEmailVerified;
    this.password = UserPassword.create({
      value: password,
    }).getValue();
    this.refreshToken = '';
    this.username = UserName.create(username).getValue();
  }

  makeEmailVerified(): UserEntityBuilder {
    this.isEmailVerified = true;
    return this;
  }

  makeLoggedIn({
    accessToken = faker.random.alphaNumeric(20),
    refreshToken = faker.random.alphaNumeric(20),
  }: {
    accessToken?: string;
    refreshToken?: string;
  } = {}): UserEntityBuilder {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
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
