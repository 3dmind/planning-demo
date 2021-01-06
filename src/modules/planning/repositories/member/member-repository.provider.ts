import { Provider } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { PrismaMemberRepository } from './prisma-member.repository';

export const MemberRepositoryProvider: Provider = {
  provide: MemberRepository,
  useClass: PrismaMemberRepository,
};
