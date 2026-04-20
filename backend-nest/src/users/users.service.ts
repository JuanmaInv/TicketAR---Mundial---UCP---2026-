import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  // Mock Database en memoria (Paso 5)
  private mockDatabase: UserEntity[] = [];

  create(createUserDto: CreateUserDto) {
    // Validar regla de negocio: el pasaporte o email no pueden estar duplicados
    const exists = this.mockDatabase.find(
      (user) =>
        user.passportNumber === createUserDto.passportNumber ||
        user.email === createUserDto.email,
    );

    if (exists) {
      throw new ConflictException(
        'Ya existe un usuario con este correo o pasaporte.',
      );
    }

    const newUser: UserEntity = {
      id: crypto.randomUUID(), // Simulando ID generado por Supabase Auth
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockDatabase.push(newUser);
    return newUser;
  }

  findAll() {
    return this.mockDatabase;
  }
}
