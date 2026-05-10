import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SectoresService } from './stadium-sectors.service';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import { ActualizarSectorEnPartidoDto } from './dto/update-sector-in-match.dto';
import { AuthenticatedUserGuard } from '../common/guards/authenticated-user.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolUsuario } from '../common/enums/rol-usuario.enum';

@Controller('sectores')
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Get()
  obtenerTodos() {
    return this.sectoresService.obtenerTodos();
  }

  @Get('partido/:idPartido')
  obtenerPorPartido(@Param('idPartido') idPartido: string) {
    return this.sectoresService.obtenerPorPartido(idPartido);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.sectoresService.obtenerUno(id);
  }

  @Post()
  crear(@Body() crearSectorDto: CrearSectorDto) {
    return this.sectoresService.crear(crearSectorDto);
  }

  @Patch('partido/:idPartido/sector/:idSector')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRADOR)
  actualizarSectorEnPartido(
    @Param('idPartido') idPartido: string,
    @Param('idSector') idSector: string,
    @Body() datos: ActualizarSectorEnPartidoDto,
  ) {
    return this.sectoresService.actualizarEnPartido(idPartido, idSector, datos);
  }
}
