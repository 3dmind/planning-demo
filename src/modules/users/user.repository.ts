import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEmailValueObject } from './domain/user-email.value-object';
import { UserNameValueObject } from './domain/user-name.value-object';
import { UserEntity } from './domain/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async exists(userEmail: UserEmailValueObject): Promise<boolean> {
    const baseUser = await this.prismaService.baseUserModel.findOne({
      where: {
        userEmail: userEmail.value,
      },
    });
    return !!baseUser === true;
  }

  async save(userEntity: UserEntity): Promise<void> {
    const exists = await this.exists(userEntity.email);

    if (!exists) {
      const baseUserModel = await UserMapper.toPersistence(userEntity);
      await this.prismaService.baseUserModel.create({
        data: baseUserModel,
      });
    }
  }

  async getUserByUsername(
    userName: UserNameValueObject,
  ): Promise<{ found: boolean; userEntity?: UserEntity }> {
    const baseUserModel = await this.prismaService.baseUserModel.findFirst({
      where: {
        username: userName.value,
      },
    });
    const found = !!baseUserModel === true;

    if (found) {
      return {
        found,
        userEntity: UserMapper.toDomain(baseUserModel),
      };
    } else {
      return {
        found,
      };
    }
  }
}
