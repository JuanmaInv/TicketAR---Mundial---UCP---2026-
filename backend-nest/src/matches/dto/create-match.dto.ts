import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  teamA: string;

  @IsString()
  @IsNotEmpty()
  teamB: string;

  @IsDateString()
  @IsNotEmpty()
  matchDate: Date;

  @IsString()
  @IsNotEmpty()
  stadiumName: string;
}
