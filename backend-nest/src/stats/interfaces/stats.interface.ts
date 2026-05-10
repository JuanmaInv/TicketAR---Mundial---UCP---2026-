export interface EstadisticasVentas {
  ingresosTotales: number;
  entradasVendidas: number;
  entradasPendientes: number;
  desglosePorSector: SectorStats[];
  ventasPorPartido: PartidoStats[];
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

export interface PartidoStats {
  partido: string;
  entradasVendidas: number;
  ingresos: number;
}
