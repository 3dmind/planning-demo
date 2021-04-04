import * as faker from 'faker';
import { AccessToken, RefreshToken } from '../../src/modules/users/domain/jwt';
import { UserEmail } from '../../src/modules/users/domain/user-email.valueobject';
import { UserName } from '../../src/modules/users/domain/user-name.valueobject';
import { UserPassword } from '../../src/modules/users/domain/user-password.valueobject';
import { User } from '../../src/modules/users/domain/user.entity';
import { UniqueEntityId } from '../../src/shared/domain';

export class UserEntityBuilder {
  private accessToken: AccessToken;
  private createdAt: Date;
  private id: UniqueEntityId;
  private email: UserEmail;
  private isEmailVerified: boolean;
  private password: UserPassword;
  private refreshToken: RefreshToken;
  private username: UserName;

  constructor() {
    const username = faker.internet.userName();
    const password = faker.internet.password(UserPassword.MIN_LENGTH);
    const email = faker.internet.email();
    const entityId = new UniqueEntityId();

    this.accessToken = '';
    this.createdAt = new Date();
    this.email = UserEmail.create(email).getValue();
    this.id = entityId;
    this.isEmailVerified = false;
    this.password = UserPassword.create({
      value: password,
      hashed: false,
    }).getValue();
    this.refreshToken = '';
    this.username = UserName.create(username).getValue();
  }

  withCreationDate(createdAt: Date): UserEntityBuilder {
    this.createdAt = createdAt;
    return this;
  }

  withId(id: UniqueEntityId): UserEntityBuilder {
    this.id = id;
    return this;
  }

  withUserName(userName: UserName): UserEntityBuilder {
    this.username = userName;
    return this;
  }

  withPassword(userPassword: UserPassword): UserEntityBuilder {
    this.password = userPassword;
    return this;
  }

  withEmail(userEmail: UserEmail): UserEntityBuilder {
    this.email = userEmail;
    return this;
  }

  withVerifiedEmail(): UserEntityBuilder {
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

  public build(): User {
    return User.create(
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
