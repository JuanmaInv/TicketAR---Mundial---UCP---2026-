import { Controller, Post, Body } from '@nestjs/common';
import { StadiumSectorsService } from './stadium-sectors.service';
import { StadiumSectorsDto } from './dto/stadium-sectores.dto';

@Controller('stadium-sectors')
export class StadiumSectorsController {
  // Inyección de dependencias: Le damos al Controlador acceso a su Servicio
  constructor(private readonly stadiumSectorsService: StadiumSectorsService) {}

  @Post()
  create(@Body() createStadiumSectorDto: StadiumSectorsDto) {
    // Aquí el Controlador delega el trabajo al Servicio (El mesero pasa la comanda al chef)
    return this.stadiumSectorsService.create(createStadiumSectorDto);
  }
}
