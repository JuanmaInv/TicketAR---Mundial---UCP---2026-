import { Injectable } from '@nestjs/common';
import { StadiumSectorsDto } from './dto/stadium-sectores.dto';
import { StadiumSectorEntity } from './entities/stadium-sector.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class StadiumSectorsService {
  // 🗄️ Nuestra "Base de Datos" temporal (Mock) para no bloquearnos mientras configuramos Supabase
  private mockDatabase: StadiumSectorEntity[] = [];

  // 🟢 CREATE
  create(createStadiumSectorDto: StadiumSectorsDto): StadiumSectorEntity {
    const newSector: StadiumSectorEntity = {
      ...createStadiumSectorDto,
      id: randomUUID(), // Simulamos el ID autogenerado (inventado)
      createdAt: new Date(),
    };

    this.mockDatabase.push(newSector); //empujamos el nuevo sector a la base de datos (Inventada)
    return newSector;
  }

  // 🔵 READ
  findAll(): StadiumSectorEntity[] {
    return this.mockDatabase;
  }
}
