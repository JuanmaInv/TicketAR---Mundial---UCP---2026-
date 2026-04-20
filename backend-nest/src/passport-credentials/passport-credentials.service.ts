import { Injectable, BadRequestException } from '@nestjs/common';
import { ValidarPasaporteDto } from './dto/validate-passport.dto';
import { PassportCredentialEntity } from './entities/passport-credential.entity';

@Injectable()
export class CredencialesService {
  private baseDeDatosSimulada: PassportCredentialEntity[] = [];

  validar(validarPasaporteDto: ValidarPasaporteDto) {
    // 🚨 Lógica Crítica: Un usuario no puede registrar dos veces el mismo pasaporte
    const existe = this.baseDeDatosSimulada.find(
      (cred) =>
        cred.documentNumber === validarPasaporteDto.documentNumber &&
        cred.countryCode === validarPasaporteDto.countryCode,
    );

    if (existe) {
      throw new BadRequestException(
        'El documento de pasaporte ya se encuentra registrado y validado en el sistema.',
      );
    }

    const nuevaCredencial: PassportCredentialEntity = {
      id: crypto.randomUUID(),
      ...validarPasaporteDto,
      isValidated: true, // Simulando que una API gubernamental devolvió 'true'
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.baseDeDatosSimulada.push(nuevaCredencial);
    return nuevaCredencial;
  }

  obtenerTodas() {
    return this.baseDeDatosSimulada;
  }
}
