export class MatchEntity {
  id: string; // UUID
  teamA: string;
  teamB: string;
  matchDate: Date;
  stadiumName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: Date;
  updatedAt: Date;
}
