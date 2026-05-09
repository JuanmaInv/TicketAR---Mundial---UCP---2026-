import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';

@Controller('estadisticas')
@UseGuards(RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR)
  async obtenerEstadisticas() {
    return await this.statsService.obtenerEstadisticasGenerales();
  }
}
