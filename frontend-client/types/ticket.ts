export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  stadium: string;
}

export interface Sector {
  name: string;
  price: number;
  capacity: number;
  available: number;
}

export interface Ticket {
  id: number;
  match: string;
  price: number;
  sector: string;
  status: 'available' | 'reserved' | 'sold';
}
