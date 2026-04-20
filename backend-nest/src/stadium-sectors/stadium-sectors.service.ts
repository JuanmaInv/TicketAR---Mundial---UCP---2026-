<<<<<<< Updated upstream
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
=======
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStadiumSectorDto } from './dto/create-stadium-sector.dto';
import { StadiumSectorEntity } from './entities/stadium-sector.entity';

@Injectable()
export class StadiumSectorsService {
  private mockDatabase: StadiumSectorEntity[] = [
    {
      id: 'popular-north',
      name: 'POPULAR',
      capacity: 10000,
      availableSeats: 10000,
      price: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'platea-east',
      name: 'PLATEA',
      capacity: 5000,
      availableSeats: 5000,
      price: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  findAll() {
    return this.mockDatabase;
  }

  findOne(id: string) {
    const sector = this.mockDatabase.find(s => s.id === id);
    if (!sector) {
      throw new NotFoundException('Sector de estadio no encontrado');
    }
    return sector;
  }

  create(dto: CreateStadiumSectorDto) {
    const newSector: StadiumSectorEntity = {
      id: crypto.randomUUID(),
      ...dto,
      availableSeats: dto.capacity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockDatabase.push(newSector);
    return newSector;
  }
>>>>>>> Stashed changes
}
