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
}
