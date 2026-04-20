import { Injectable, NotFoundException } from '@nestjs/common';
import { CrearSectorDto } from './dto/create-stadium-sector.dto';
import { StadiumSectorEntity } from './entities/stadium-sector.entity';

@Injectable()
export class SectoresService {
  private baseDeDatosSimulada: StadiumSectorEntity[] = [
    {
      id: 'popular-norte',
      name: 'POPULAR',
      capacity: 10000,
      availableSeats: 10000,
      price: 50000, // ARS
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'platea-este',
      name: 'PLATEA',
      capacity: 5000,
      availableSeats: 5000,
      price: 150000, // ARS
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  obtenerTodos() {
    return this.baseDeDatosSimulada;
  }

  obtenerUno(id: string) {
    const sector = this.baseDeDatosSimulada.find((s) => s.id === id);
    if (!sector) {
      throw new NotFoundException('Sector de estadio no encontrado');
    }
    return sector;
  }

  crear(dto: CrearSectorDto) {
    const nuevoSector: StadiumSectorEntity = {
      id: crypto.randomUUID(),
      name: dto.nombre,
      capacity: dto.capacidad,
      availableSeats: dto.capacidad,
      price: dto.precio,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.baseDeDatosSimulada.push(nuevoSector);
    return nuevoSector;
  }
}
