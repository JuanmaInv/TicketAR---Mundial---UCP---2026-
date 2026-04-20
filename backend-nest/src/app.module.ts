import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { PassportCredentialsModule } from './passport-credentials/passport-credentials.module';
import { StadiumSectorsModule } from './stadium-sectors/stadium-sectors.module';
import { MatchesModule } from './matches/matches.module';
import { UsersModule } from './users/users.module';


//MODULO RAIZ QUE CONECTA A TODOS LOS MODULOS ANTERIORES
@Module({
  imports: [
    TicketsModule,
    PaymentsModule,
    PassportCredentialsModule,
    StadiumSectorsModule,
    MatchesModule,
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
