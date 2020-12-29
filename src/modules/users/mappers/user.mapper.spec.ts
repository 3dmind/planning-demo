import { BaseUserModel, Prisma } from '@prisma/client';
import * as faker from 'faker';
import { UniqueEntityId } from '../../../shared/domain';
import { UserEmail } from '../domain/user-email.valueobject';
import { UserName } from '../domain/user-name.valueobject';
import { UserPassword } from '../domain/user-password.valueobject';
import { UserProps } from '../domain/user-props.interface';
import { UserEntity } from '../domain/user.entity';
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
    const userEntity = UserEntity.create(props, entityId).getValue();

    const model = await UserMapper.toPersistence(userEntity);

    expect(model).toMatchObject<Prisma.BaseUserModelCreateInput>({
      baseUserId: userEntity.userId.id.toString(),
      createdAt: userEntity.props.createdAt,
      isEmailVerified: userEntity.props.isEmailVerified,
      userEmail: userEntity.props.email.value,
      username: userEntity.props.username.value,
      userPassword: userEntity.props.password.value,
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

    const userEntity = UserMapper.toDomain(mockedBaseUserModel);

    expect(userEntity).toBeDefined();
    expect(userEntity).toBeInstanceOf(UserEntity);
    expect(userEntity.userId.id.toValue()).toEqual(idFixture);
    expect(userEntity.props.createdAt).toEqual(dateFixture);
    expect(userEntity.props.isEmailVerified).toEqual(
      mockedBaseUserModel.isEmailVerified,
    );
    expect(userEntity.props.email.value).toEqual(emailFixture);
    expect(userEntity.props.username.value).toEqual(userNameFixture);
    expect(userEntity.props.password.value).toEqual(passwordFixture);
  });

  it('should map Entity to DTO', () => {
    const props: UserProps = {
      createdAt: dateFixture,
      email,
      isEmailVerified: false,
      password,
      username,
    };
    const userEntity = UserEntity.create(props, entityId).getValue();

    const userDto = UserMapper.toDto(userEntity);

    expect(userDto).toMatchObject<UserDto>({
      createdAt: dateFixture.toISOString(),
      email: emailFixture,
      isEmailVerified: false,
      username: userNameFixture,
    });
  });
});
