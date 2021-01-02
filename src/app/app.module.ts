import { Module } from '@nestjs/common';
import { DomainEventPublisherModule } from '../domain-event-publisher/domain-event-publisher.module';
import { PlanningModule } from '../modules/planning/planning.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [DomainEventPublisherModule, PlanningModule, UsersModule],
})
export class AppModule {}
