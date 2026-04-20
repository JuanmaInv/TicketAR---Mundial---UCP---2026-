import { Module } from '@nestjs/common';
import { EntradasModule } from './tickets/tickets.module';
import { PagosModule } from './payments/payments.module';
import { CredencialesPasaporteModule } from './passport-credentials/passport-credentials.module';
import { SectoresModule } from './stadium-sectors/stadium-sectors.module';
import { PartidosModule } from './matches/matches.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    PartidosModule,
    SectoresModule,
    EntradasModule,
    PagosModule,
    CredencialesPasaporteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
