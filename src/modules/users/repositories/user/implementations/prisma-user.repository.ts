import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { UserEmail } from '../../../domain/user-email.valueobject';
import { UserName } from '../../../domain/user-name.valueobject';
import { User } from '../../../domain/user.entity';
import { MaybeUser, UserRepository } from '../../../domain/user.repository';
import { UserMapper } from '../../../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async exists(userEmail: UserEmail): Promise<boolean> {
    const baseUser = await this.prismaService.baseUserModel.findUnique({
      where: {
        userEmail: userEmail.value,
      },
    });
    return !!baseUser === true;
  }

  async getUserByUsername(userName: UserName): Promise<MaybeUser> {
    const baseUserModel = await this.prismaService.baseUserModel.findFirst({
      where: {
        username: userName.value,
      },
    });
    const found = !!baseUserModel === true;

    if (found) {
      return {
        found,
        user: UserMapper.toDomain(baseUserModel),
      };
    } else {
      return {
        found,
      };
    }
  }

  async save(user: User): Promise<void> {
    const exists = await this.exists(user.email);

    if (!exists) {
      const baseUserModel = await UserMapper.toPersistence(user);
      await this.prismaService.baseUserModel.create({
        data: baseUserModel,
      });
    }
  }
}
