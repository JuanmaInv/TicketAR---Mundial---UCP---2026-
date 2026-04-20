import { Controller, Post, Body, Get } from '@nestjs/common';
import { PassportCredentialsService } from './passport-credentials.service';
import { ValidatePassportDto } from './dto/validate-passport.dto';

@Controller('passport-credentials')
export class PassportCredentialsController {
  constructor(
    private readonly passportCredentialsService: PassportCredentialsService,
  ) {}

  @Post('validate')
  validate(@Body() validatePassportDto: ValidatePassportDto) {
    return this.passportCredentialsService.validate(validatePassportDto);
  }

  @Get()
  findAll() {
    return this.passportCredentialsService.findAll();
  }
}
