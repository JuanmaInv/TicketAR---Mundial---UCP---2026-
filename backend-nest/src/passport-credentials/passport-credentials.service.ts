import { Injectable, BadRequestException } from '@nestjs/common';
import { ValidarPasaporteDto } from './dto/validate-passport.dto';
import { CredencialPasaporteEntidad } from './entities/passport-credential.entity';

@Injectable()
export class CredencialesService {
  private baseDeDatosSimulada: CredencialPasaporteEntidad[] = [];

  validar(validarPasaporteDto: ValidarPasaporteDto) {
    // 🚨 Lógica Crítica: Un usuario no puede registrar dos veces el mismo pasaporte
    const existe = this.baseDeDatosSimulada.find(
      (cred) =>
        cred.numerodocumento === validarPasaporteDto.numerodocumento &&
        cred.codigoPais === validarPasaporteDto.codigoPais,
    );

    if (existe) {
      throw new BadRequestException(
        'El documento de pasaporte ya se encuentra registrado y validado en el sistema.',
      );
    }

    const nuevaCredencial: CredencialPasaporteEntidad = {
      id: crypto.randomUUID(),
      idUsuario: validarPasaporteDto.idUsuario,
      numerodocumento: validarPasaporteDto.numerodocumento,
      codigoPais: validarPasaporteDto.codigoPais,
      estaValidado: true, // Simulando que una API gubernamental devolvió 'true'
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    this.baseDeDatosSimulada.push(nuevaCredencial);
    return nuevaCredencial;
  }

  obtenerTodas() {
    return this.baseDeDatosSimulada;
  }
}

