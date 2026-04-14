import { Ticket } from '../types/ticket';

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    match: 'Argentina vs France',
    price: 1500,
    sector: 'Platea San Martín',
    status: 'available'
  },
  {
    id: 2,
    match: 'Brazil vs Germany',
    price: 1200,
    sector: 'Popular Norte',
    status: 'available'
  },
  {
    id: 3,
    match: 'Uruguay vs Italy',
    price: 900,
    sector: 'Platea Belgrano',
    status: 'reserved'
  },
  {
    id: 4,
    match: 'Spain vs Netherlands',
    price: 1100,
    sector: 'Sívori Alta',
    status: 'available'
  }
];
