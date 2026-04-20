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
    return this.stadiumSectorsService.create(createStadiumSectorDto);
  }
}
