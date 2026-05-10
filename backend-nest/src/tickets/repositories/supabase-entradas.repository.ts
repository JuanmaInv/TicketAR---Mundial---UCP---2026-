import { Injectable, Logger } from '@nestjs/common';
import {
  IEntradasRepository,
  CrearEntradaDatos,
  EntradaExpirada,
} from './entradas.repository.interface';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { TicketEntity } from '../entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';

@Injectable()
export class SupabaseEntradasRepository implements IEntradasRepository {
  private readonly logger = new Logger(SupabaseEntradasRepository.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async validarPasaporteUsuario(idUsuario: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('numero_pasaporte')
      .eq('id', idUsuario)
      .single();

    if (error || !data?.numero_pasaporte) return false;
    return true;
  }

  /**
   * Cuenta las entradas activas (RESERVADO o PAGADO) de un usuario para un partido.
   * Suma el campo cantidad de cada fila porque las entradas son agrupadas.
   */
  async contarEntradasActivas(
    idUsuario: string,
    idPartido: string,
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select('cantidad')
      .eq('id_usuario', idUsuario)
      .eq('id_partido', idPartido)
      .neq('estado', TicketStatus.CANCELADO);

    if (error || !data) return 0;

    // Sumar el campo cantidad de cada fila activa
    return data.reduce((total, row) => total + (Number(row.cantidad) || 0), 0);
  }

  async obtenerStockDisponible(
    idPartido: string,
    idSector: string,
  ): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector)
      .single();

    if (error || !data) return null;
    return Number(data.asientos_disponibles);
  }

  async crear(datos: CrearEntradaDatos): Promise<TicketEntity> {
    const { data, error } = (await this.supabase
      .from('entradas')
      .insert([datos])
      .select()
      .single()) as { data: unknown; error: Error | null };

    if (error) throw error;
    return this.mapearTicket(data);
  }

  async obtenerTodas(): Promise<TicketEntity[]> {
    const { data, error } = await this.supabase.from('entradas').select('*');

    if (error) throw error;
    return data.map((item) => this.mapearTicket(item));
  }

  async obtenerUna(id: string): Promise<TicketEntity | null> {
    const { data, error } = (await this.supabase
      .from('entradas')
      .select('*')
      .eq('id', id)
      .maybeSingle()) as { data: unknown; error: Error | null };

    if (error || !data) return null;
    return this.mapearTicket(data);
  }

  async actualizarEstado(
    id: string,
    estado: TicketStatus,
  ): Promise<TicketEntity> {
    const { data, error } = (await this.supabase
      .from('entradas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()) as { data: unknown; error: Error | null };

    if (error) throw error;
    return this.mapearTicket(data);
  }

  async guardarPaymentId(id: string, paymentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('entradas')
      .update({ mercadopago_payment_id: paymentId })
      .eq('id', id);

    if (error) {
      this.logger.error(
        `Error al guardar payment ID ${paymentId} en entrada ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Decrementa stock usando UPDATE directo (no RPC).
   * Lee el valor actual y resta la cantidad.
   */
  async decrementarStock(
    idPartido: string,
    idSector: string,
    cantidad: number,
  ): Promise<void> {
    // Leer stock actual
    const { data: current, error: readError } = await this.supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector)
      .single();

    if (readError || !current) {
      throw new Error('No se pudo leer el stock actual del sector');
    }

    const stockAntes = Number(current.asientos_disponibles);
    const stockDespues = stockAntes - cantidad;

    this.logger.log(
      `[Stock] Decrementar: Partido=${idPartido}, Sector=${idSector}, ` +
        `Cantidad=${cantidad}, StockAntes=${stockAntes}, StockDespues=${stockDespues}`,
    );

    const { error } = await this.supabase
      .from('partido_sectores')
      .update({ asientos_disponibles: stockDespues })
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector);

    if (error) {
      throw new Error(`Error al decrementar stock: ${error.message}`);
    }
  }

  /**
   * Incrementa stock usando UPDATE directo (no RPC).
   * Lee el valor actual y suma la cantidad.
   */
  async incrementarStock(
    idPartido: string,
    idSector: string,
    cantidad: number,
  ): Promise<void> {
    // Leer stock actual
    const { data: current, error: readError } = await this.supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector)
      .single();

    if (readError || !current) {
      throw new Error('No se pudo leer el stock actual del sector');
    }

    const stockAntes = Number(current.asientos_disponibles);
    const stockDespues = stockAntes + cantidad;

    this.logger.log(
      `[Stock] Incrementar: Partido=${idPartido}, Sector=${idSector}, ` +
        `Cantidad=${cantidad}, StockAntes=${stockAntes}, StockDespues=${stockDespues}`,
    );

    const { error } = await this.supabase
      .from('partido_sectores')
      .update({ asientos_disponibles: stockDespues })
      .eq('id_partido', idPartido)
      .eq('id_sector', idSector);

    if (error) {
      throw new Error(`Error al incrementar stock: ${error.message}`);
    }
  }

  async obtenerExpiradas(fechaReferencia: string): Promise<EntradaExpirada[]> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select('id, id_sector, id_partido, cantidad')
      .eq('estado', TicketStatus.RESERVADO)
      .lt('fecha_expiracion_reserva', fechaReferencia);

    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id as string,
      id_partido: row.id_partido as string,
      id_sector: row.id_sector as string,
      cantidad: Number(row.cantidad) || 1,
    }));
  }

  /**
   * Recalcula el estado del partido según el stock total.
   * - Si estado = "cancelado" → no modifica.
   * - Si stock_total = 0 → actualiza a "agotado".
   * - Si stock_total > 0 → actualiza a "disponible".
   */
  async recalcularEstadoPartido(idPartido: string): Promise<void> {
    // 1. Leer estado actual del partido
    const { data: partido, error: partidoError } = await this.supabase
      .from('partidos')
      .select('estado')
      .eq('id', idPartido)
      .single();

    if (partidoError || !partido) {
      this.logger.warn(
        `[RecalcularEstado] No se encontró el partido ${idPartido}`,
      );
      return;
    }

    const estadoActual = (partido.estado as string) || '';

    // Si está cancelado, no tocamos
    if (estadoActual === 'cancelado') {
      this.logger.log(
        `[RecalcularEstado] Partido ${idPartido} está cancelado. No se modifica.`,
      );
      return;
    }

    // 2. Calcular stock total sumando asientos_disponibles de todos los sectores
    const { data: sectores, error: sectoresError } = await this.supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', idPartido);

    if (sectoresError || !sectores) {
      this.logger.warn(
        `[RecalcularEstado] No se pudieron obtener sectores del partido ${idPartido}`,
      );
      return;
    }

    const stockTotal = sectores.reduce(
      (sum, row) => sum + (Number(row.asientos_disponibles) || 0),
      0,
    );

    // 3. Determinar nuevo estado
    const nuevoEstado = stockTotal === 0 ? 'agotado' : 'disponible';

    if (nuevoEstado !== estadoActual) {
      this.logger.log(
        `[RecalcularEstado] Partido ${idPartido}: StockTotal=${stockTotal}, ` +
          `EstadoAntes=${estadoActual}, EstadoDespues=${nuevoEstado}`,
      );

      const { error: updateError } = await this.supabase
        .from('partidos')
        .update({ estado: nuevoEstado })
        .eq('id', idPartido);

      if (updateError) {
        this.logger.error(
          `[RecalcularEstado] Error al actualizar estado: ${updateError.message}`,
        );
      }
    } else {
      this.logger.log(
        `[RecalcularEstado] Partido ${idPartido}: StockTotal=${stockTotal}, Estado=${estadoActual} (sin cambio)`,
      );
    }
  }

  private mapearTicket(data: unknown): TicketEntity {
    const d = data as {
      id: string;
      id_usuario: string;
      id_partido: string;
      id_sector: string;
      cantidad: number;
      precio_unitario: number;
      precio_total: number;
      estado: TicketStatus;
      fecha_expiracion_reserva?: string;
      codigo_qr?: string;
      mercadopago_payment_id?: string;
      fecha_creacion?: string;
      fecha_actualizacion?: string;
    };

    return {
      id: d.id,
      idUsuario: d.id_usuario,
      idPartido: d.id_partido,
      idSector: d.id_sector,
      cantidad: Number(d.cantidad) || 1,
      precioUnitario: Number(d.precio_unitario) || 0,
      precioTotal: Number(d.precio_total) || 0,
      estado: d.estado,
      fechaExpiracionReserva: d.fecha_expiracion_reserva
        ? new Date(d.fecha_expiracion_reserva)
        : undefined,
      codigoQr: d.codigo_qr,
      mercadopagoPaymentId: d.mercadopago_payment_id,
      fechaCreacion: new Date(d.fecha_creacion || new Date()),
      fechaActualizacion: new Date(d.fecha_actualizacion || new Date()),
    };
  }
}
