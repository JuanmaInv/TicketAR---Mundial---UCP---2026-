import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { SectorType } from '../../common/enums/sector-type.enum';

export class StadiumSectorsDto {
  @IsUUID()
  @IsNotEmpty()
  matchId: string;

  @IsEnum(SectorType)
  @IsNotEmpty()
  sector: SectorType;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacity: number;
}
