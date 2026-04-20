import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidatePassportDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsString()
  @Length(2, 3) // e.g. "AR", "USA"
  countryCode: string;
}
