import { Module } from '@nestjs/common';
import { PlanningModule } from '../modules/planning/planning.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [PlanningModule, UsersModule],
})
export class AppModule {}
