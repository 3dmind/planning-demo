import { Provider } from '@nestjs/common';
import { MemberRepository } from '../../domain/member.repository';
import { PrismaMemberRepository } from './implementations/prisma-member.repository';

export const MemberRepositoryProvider: Provider = {
  provide: MemberRepository,
  useClass: PrismaMemberRepository,
};
