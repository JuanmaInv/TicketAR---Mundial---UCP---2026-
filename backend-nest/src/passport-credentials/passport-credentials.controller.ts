import { Controller, Post, Body, Get } from '@nestjs/common';
import { CredencialesService } from './passport-credentials.service';
import { ValidarPasaporteDto } from './dto/validate-passport.dto';

@Controller('credenciales-pasaporte')
export class CredencialesController {
  constructor(
    private readonly credencialesService: CredencialesService,
  ) {}

  @Post('validar')
  validar(@Body() validarPasaporteDto: ValidarPasaporteDto) {
    return this.credencialesService.validar(validarPasaporteDto);
  }

  @Get()
  obtenerTodas() {
    return this.credencialesService.obtenerTodas();
  }
}
