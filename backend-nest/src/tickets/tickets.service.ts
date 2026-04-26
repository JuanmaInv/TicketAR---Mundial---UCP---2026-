import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CrearEntradaDto } from './dto/create-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';

@Injectable()
export class EntradasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Proceso Atómico de Reserva de Entrada.
   * Conectado a Supabase con nombres de entidad alineados con main.
   * Sigue las reglas de negocio: Pasaporte -> No duplicados -> Stock -> Insertar.
   */
  async crear(crearEntradaDto: CrearEntradaDto): Promise<TicketEntity> {
    const supabase = this.supabaseService.getClient();

    // 1. VALIDACIÓN DE PASAPORTE
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('pasaporte')
      .eq('id', crearEntradaDto.idUsuario)
      .single();

    if (errorUsuario || !usuario?.pasaporte) {
      throw new BadRequestException(
        'El usuario debe tener un pasaporte registrado para comprar.',
      );
    }

    // 2. REGLA CRÍTICA: MÁXIMO 1 ENTRADA POR PARTIDO
    const { data: entradaExistente } = await supabase
      .from('entradas')
      .select('id')
      .eq('usuario_id', crearEntradaDto.idUsuario)
      .eq('partido_id', crearEntradaDto.idPartido)
      .neq('estado', TicketStatus.CANCELADO)
      .maybeSingle();

    if (entradaExistente) {
      throw new ConflictException(
        'Ya tienes una reserva activa o pagada para este partido.',
      );
    }

    // 3. VERIFICACIÓN DE STOCK (En la tabla de inventario real)
    const { data: inventario, error: errorStock } = await supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', crearEntradaDto.idPartido)
      .eq('id_sector', crearEntradaDto.idSector)
      .single();

    if (errorStock || !inventario) {
      throw new NotFoundException(
        'El sector solicitado no está disponible para este partido.',
      );
    }

    if (inventario.asientos_disponibles <= 0) {
      throw new ConflictException(
        'Lo sentimos, no quedan asientos disponibles en este sector.',
      );
    }

    // 4. CREACIÓN DE LA RESERVA (Trigger de DB bajará el stock)
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    const { data: nuevaEntrada, error: errorInsert } = await supabase
      .from('entradas')
      .insert([
        {
          usuario_id: crearEntradaDto.idUsuario,
          partido_id: crearEntradaDto.idPartido,
          sector_id: crearEntradaDto.idSector,
          estado: TicketStatus.RESERVADO,
          fecha_expiracion_reserva: fechaExpiracion.toISOString(),
        },
      ])
      .select()
      .single();

    if (errorInsert) {
      throw new BadRequestException(
        `Error al crear la reserva: ${errorInsert.message}`,
      );
    }

    // Retornamos mapeado a la entidad en español
    return {
      id: nuevaEntrada.id,
      idUsuario: nuevaEntrada.usuario_id,
      idPartido: nuevaEntrada.partido_id,
      idSector: nuevaEntrada.sector_id,
      estado: nuevaEntrada.estado,
      fechaExpiracionReserva: nuevaEntrada.fecha_expiracion_reserva
        ? new Date(nuevaEntrada.fecha_expiracion_reserva)
        : undefined,
      fechaCreacion: new Date(nuevaEntrada.created_at),
      fechaActualizacion: new Date(nuevaEntrada.updated_at),
    } as TicketEntity;
  }

  async obtenerTodas() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*, partidos(*), sectores_estadio(*)'); // Traemos data relacionada

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
