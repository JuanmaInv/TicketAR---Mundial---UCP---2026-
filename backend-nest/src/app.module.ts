import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { PassportCredentialsModule } from './passport-credentials/passport-credentials.module';
import { StadiumSectorsModule } from './stadium-sectors/stadium-sectors.module';
import { PartidosModule } from './matches/matches.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    TicketsModule,
    PaymentsModule,
    PassportCredentialsModule,
    StadiumSectorsModule,
    PartidosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
