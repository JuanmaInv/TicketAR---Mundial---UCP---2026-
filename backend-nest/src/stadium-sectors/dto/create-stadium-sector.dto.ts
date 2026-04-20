import { IsString, IsNumber, Min } from 'class-validator';

export class CreateStadiumSectorDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
