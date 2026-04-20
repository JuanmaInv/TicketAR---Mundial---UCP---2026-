import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { PassportCredentialsModule } from './passport-credentials/passport-credentials.module';
import { StadiumSectorsModule } from './stadium-sectors/stadium-sectors.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [
    TicketsModule, 
    PaymentsModule, 
    PassportCredentialsModule, 
    StadiumSectorsModule, 
    MatchesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
