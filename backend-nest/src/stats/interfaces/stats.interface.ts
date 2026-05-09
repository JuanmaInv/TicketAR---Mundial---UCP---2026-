export interface EstadisticasVentas {
  ingresosTotales: number;
  entradasVendidas: number;
  entradasPendientes: number;
  desglosePorSector: SectorStats[];
  proximoPartidoOcupacion: {
    partido: string;
    porcentaje: number;
  };
}

export interface SectorStats {
  sector: string;
  cantidad: number;
  ingresos: number;
}
