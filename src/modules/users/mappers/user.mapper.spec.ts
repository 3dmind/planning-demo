import { BaseUserModel, Prisma } from '@prisma/client';
import * as faker from 'faker';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from '../domain/user-email.valueobject';
import { UserName } from '../domain/user-name.valueobject';
import { UserPassword } from '../domain/user-password.valueobject';
import { UserProps } from '../domain/user-props.interface';
import { User } from '../domain/user.entity';
import { UserDto } from '../dtos/user.dto';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  const dateFixture = new Date();
  const idFixture = faker.random.uuid();
  const userNameFixture = faker.internet.userName();
  const passwordFixture = faker.internet.password(6);
  const emailFixture = faker.internet.email().toLowerCase();
  const entityId = new UniqueEntityId(idFixture);
  const username = UserName.create(userNameFixture).getValue();
  const password = UserPassword.create({
    value: passwordFixture,
    hashed: true,
  }).getValue();
  const email = UserEmail.create(emailFixture).getValue();

  it('should map Entity to Model', async () => {
    expect.assertions(1);
    const props: UserProps = {
      createdAt: dateFixture,
      email,
      isEmailVerified: false,
      password,
      username,
    };
    const user = User.create(props, entityId).getValue();

    const model = await UserMapper.toPersistence(user);

    expect(model).toMatchObject<Prisma.BaseUserModelCreateInput>({
      baseUserId: user.userId.id.toString(),
      createdAt: user.props.createdAt,
      isEmailVerified: user.props.isEmailVerified,
      userEmail: user.props.email.value,
      username: user.props.username.value,
      userPassword: user.props.password.value,
    });
  });

  it('should map Model to Entity', () => {
    expect.assertions(8);
    const mockedBaseUserModel: BaseUserModel = {
      baseUserId: idFixture,
      createdAt: dateFixture,
      isEmailVerified: true,
      updatedAt: dateFixture,
      userEmail: emailFixture,
      username: userNameFixture,
      userPassword: passwordFixture,
    };

    const user = UserMapper.toDomain(mockedBaseUserModel);

    expect(user).toBeDefined();
    expect(user).toBeInstanceOf(User);
    expect(user.userId.id.toValue()).toEqual(idFixture);
    expect(user.props.createdAt).toEqual(dateFixture);
    expect(user.props.isEmailVerified).toEqual(
      mockedBaseUserModel.isEmailVerified,
    );
    expect(user.props.email.value).toEqual(emailFixture);
    expect(user.props.username.value).toEqual(userNameFixture);
    expect(user.props.password.value).toEqual(passwordFixture);
  });

  it('should map Entity to DTO', () => {
    const props: UserProps = {
      createdAt: dateFixture,
      email,
      isEmailVerified: false,
      password,
      username,
    };
    const user = User.create(props, entityId).getValue();

    const userDto = UserMapper.toDto(user);

    expect(userDto).toMatchObject<UserDto>({
      createdAt: dateFixture.toISOString(),
      email: emailFixture,
      isEmailVerified: false,
      username: userNameFixture,
    });
  });
});
