export class SectorEntidad {
  id: string;
  nombre: string; // POPULAR, PALCO, PLATEA, PRENSA
  capacidad: number;
  capacidadDisponible: number;
  precio: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
