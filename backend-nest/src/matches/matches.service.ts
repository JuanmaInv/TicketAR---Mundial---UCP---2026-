import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class MatchesService {
  private mockDatabase: MatchEntity[] = [];

  create(createMatchDto: CreateMatchDto) {
    const newMatch: MatchEntity = {
      id: crypto.randomUUID(),
      ...createMatchDto,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockDatabase.push(newMatch);
    return newMatch;
  }

  findAll() {
    return this.mockDatabase;
  }
}
