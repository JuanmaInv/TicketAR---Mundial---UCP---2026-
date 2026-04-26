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
   */
  async crear(crearEntradaDto: CrearEntradaDto): Promise<any> {
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

    // 2. MÁXIMO 1 ENTRADA POR PARTIDO
    const { data: entradaExistente } = await supabase
      .from('entradas')
      .select('id')
      .eq('usuario_id', crearEntradaDto.idUsuario)
      .eq('partido_id', crearEntradaDto.idPartido)
      .neq('estado', TicketStatus.CANCELADO)
      .maybeSingle();

    if (entradaExistente) {
      throw new ConflictException(
        'Ya tienes una reserva activa para este partido.',
      );
    }

    // 3. VERIFICACIÓN DE STOCK
    const { data: inventario, error: errorStock } = await supabase
      .from('partido_sectores')
      .select('asientos_disponibles')
      .eq('id_partido', crearEntradaDto.idPartido)
      .eq('id_sector', crearEntradaDto.idSector)
      .single();

    if (errorStock || !inventario) {
      throw new NotFoundException('Sector no disponible para este partido.');
    }

    if (inventario.asientos_disponibles <= 0) {
      throw new ConflictException('No quedan asientos disponibles.');
    }

    // 4. INSERCIÓN (Nombres de DB en snake_case, Entidad en CamelCase)
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
      throw new BadRequestException(`Error DB: ${errorInsert.message}`);
    }

    // Retornamos mapeado a la entidad en inglés
    return {
      id: nuevaEntrada.id,
      userId: nuevaEntrada.usuario_id,
      sectorId: nuevaEntrada.sector_id,
      status: nuevaEntrada.estado,
      reservationExpiresAt: new Date(nuevaEntrada.fecha_expiracion_reserva),
      createdAt: new Date(nuevaEntrada.created_at),
      updatedAt: new Date(nuevaEntrada.updated_at),
    } as TicketEntity;
  }

  async obtenerTodas() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('entradas')
      .select('*');

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
