import { BaseUserModel, BaseUserModelCreateInput } from '@prisma/client';
import * as faker from 'faker';
import { UserEmailValueObject } from './domain/user-email.value-object';
import { UserNameValueObject } from './domain/user-name.value-object';
import { UserPasswordValueObject } from './domain/user-password.value-object';
import { UserEntity } from './domain/user.entity';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  it('should map Entity to Model', async () => {
    expect.assertions(1);
    const username = UserNameValueObject.create(
      faker.internet.userName(),
    ).getValue();
    const password = UserPasswordValueObject.create({
      value: faker.internet.password(6),
      hashed: true,
    }).getValue();
    const email = UserEmailValueObject.create(
      faker.internet.email(),
    ).getValue();
    const userEntity = UserEntity.create({
      username,
      password,
      email,
    }).getValue();

    const model = await UserMapper.toPersistence(userEntity);

    expect(model).toMatchObject<BaseUserModelCreateInput>({
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
    const mockedId = faker.random.uuid();
    const mockedUsername = faker.internet.userName();
    const mockedPassword = faker.internet.password(6);
    const mockedEmail = faker.internet.email().toLowerCase();
    const mockedDate = new Date();
    const mockedBaseUserModel: BaseUserModel = {
      baseUserId: mockedId,
      createdAt: mockedDate,
      isEmailVerified: true,
      updatedAt: mockedDate,
      userEmail: mockedEmail,
      username: mockedUsername,
      userPassword: mockedPassword,
    };

    const userEntity = UserMapper.toDomain(mockedBaseUserModel);

    expect(userEntity).toBeDefined();
    expect(userEntity).toBeInstanceOf(UserEntity);
    expect(userEntity.userId.id.toValue()).toEqual(mockedId);
    expect(userEntity.props.createdAt).toEqual(mockedDate);
    expect(userEntity.props.isEmailVerified).toEqual(
      mockedBaseUserModel.isEmailVerified,
    );
    expect(userEntity.props.email.value).toEqual(mockedEmail);
    expect(userEntity.props.username.value).toEqual(mockedUsername);
    expect(userEntity.props.password.value).toEqual(mockedPassword);
  });
});
