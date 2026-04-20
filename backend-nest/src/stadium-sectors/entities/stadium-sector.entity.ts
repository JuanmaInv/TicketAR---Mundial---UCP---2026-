<<<<<<< Updated upstream
import { SectorType } from '../../common/enums/sector-type.enum';

export interface StadiumSectorEntity {
  id: string; // Generado automáticamente por la base de datos (UUID)
  stadiumId: string;
  sectorType: SectorType;
  capacity: number;
  basePrice: number;
  createdAt: Date; // Timestamp de cuándo se creó el registro
=======
export class StadiumSectorEntity {
  id: string;
  name: string; // PLATEA, PALCO, POPULAR, PRENSA
  capacity: number;
  availableSeats: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
>>>>>>> Stashed changes
}
