<<<<<<< Updated upstream
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
=======
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StadiumSectorsService } from './stadium-sectors.service';
import { CreateStadiumSectorDto } from './dto/create-stadium-sector.dto';

@Controller('stadium-sectors')
export class StadiumSectorsController {
  constructor(private readonly stadiumSectorsService: StadiumSectorsService) {}

  @Get()
  findAll() {
    return this.stadiumSectorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stadiumSectorsService.findOne(id);
  }

  @Post()
  create(@Body() createStadiumSectorDto: CreateStadiumSectorDto) {
>>>>>>> Stashed changes
    return this.stadiumSectorsService.create(createStadiumSectorDto);
  }
}
