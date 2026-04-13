import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
