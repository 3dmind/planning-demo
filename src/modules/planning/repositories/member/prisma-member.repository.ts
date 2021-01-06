import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UniqueEntityId } from '../../../../shared/domain';
import { Member } from '../../domain/member.entity';
import { MemberMapper } from '../../mappers/member.mapper';
import { MemberRepository } from './member.repository';

@Injectable()
export class PrismaMemberRepository extends MemberRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  public async exists(id: UniqueEntityId): Promise<boolean> {
    const memberModel = await this.prismaService.memberModel.findFirst({
      where: {
        memberBaseId: id.toString(),
      },
    });
    return !!memberModel === true;
  }

  public async getMemberByUserId(
    id: UniqueEntityId,
  ): Promise<{ found: boolean; member?: Member }> {
    const memberModel = await this.prismaService.memberModel.findFirst({
      where: {
        memberBaseId: id.toString(),
      },
    });
    const found = !!memberModel === true;

    if (found) {
      const member = MemberMapper.toDomain(memberModel);
      return {
        found,
        member,
      };
    } else {
      return {
        found,
      };
    }
  }

  public async save(member: Member): Promise<void> {
    const exists = await this.exists(member.userId.id);
    if (!exists) {
      const memberModelCreateInput = MemberMapper.toPersistence(member);
      await this.prismaService.memberModel.create({
        data: memberModelCreateInput,
      });
    }
  }
}
