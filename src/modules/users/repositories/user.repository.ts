import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserEmail } from '../domain/user-email.valueobject';
import { UserName } from '../domain/user-name.valueobject';
import { UserEntity } from '../domain/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async exists(userEmail: UserEmail): Promise<boolean> {
    const baseUser = await this.prismaService.baseUserModel.findUnique({
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
    userName: UserName,
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
