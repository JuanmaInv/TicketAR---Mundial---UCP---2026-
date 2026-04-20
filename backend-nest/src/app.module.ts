import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { PassportCredentialsModule } from './passport-credentials/passport-credentials.module';
import { StadiumSectorsModule } from './stadium-sectors/stadium-sectors.module';
import { MatchesModule } from './matches/matches.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    MatchesModule,
    StadiumSectorsModule,
    TicketsModule,
    PaymentsModule,
    PassportCredentialsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
