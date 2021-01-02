import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DomainEventPublisherService } from './domain-event-publisher.service';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      verboseMemoryLeak: true,
    }),
  ],
  providers: [DomainEventPublisherService],
  exports: [DomainEventPublisherService],
})
export class DomainEventPublisherModule {}
