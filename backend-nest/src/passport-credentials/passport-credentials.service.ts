import { Injectable, BadRequestException } from '@nestjs/common';
import { ValidatePassportDto } from './dto/validate-passport.dto';
import { PassportCredentialEntity } from './entities/passport-credential.entity';

@Injectable()
export class PassportCredentialsService {
  private mockDatabase: PassportCredentialEntity[] = [];

  validate(validatePassportDto: ValidatePassportDto) {
    // 🚨 Lógica Crítica: Un usuario no puede registrar dos veces el mismo pasaporte
    const exists = this.mockDatabase.find(
      (cred) =>
        cred.documentNumber === validatePassportDto.documentNumber &&
        cred.countryCode === validatePassportDto.countryCode,
    );

    if (exists) {
      throw new BadRequestException(
        'El documento de pasaporte ya se encuentra registrado y validado en el sistema.',
      );
    }

    const newCredential: PassportCredentialEntity = {
      id: crypto.randomUUID(),
      ...validatePassportDto,
      isValidated: true, // Simulando que una API gubernamental devolvió 'true'
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockDatabase.push(newCredential);
    return newCredential;
  }

  findAll() {
    return this.mockDatabase;
  }
}
