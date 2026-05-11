export interface EstadisticasVentas {
  ingresosTotales: number;
  entradasVendidas: number;
  entradasPendientes: number;
  entradasCanceladas: number;
  desglosePorSector: SectorStats[];
  ventasPorPartido: PartidoStats[];
  detallePorPartidoSectorEstado: DetallePartidoSectorEstado[];
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

export interface DetalleSectorEstado {
  idSector: string;
  sector: string;
  pagadoCantidad: number;
  reservadoCantidad: number;
  canceladoCantidad: number;
  ingresosPagado: number;
}

export interface DetallePartidoSectorEstado {
  idPartido: string;
  partido: string;
  sectores: DetalleSectorEstado[];
}
