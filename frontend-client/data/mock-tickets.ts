import { Ticket } from '../types/ticket';

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    partidoId: 'Argentina vs Francia',
    precio: 1500,
    sector: 'Platea San Martín',
    estado: 'disponible'
  },
  {
    id: '2',
    partidoId: 'Brasil vs Alemania',
    precio: 1200,
    sector: 'Popular Norte',
    estado: 'disponible'
  },
  {
    id: '3',
    partidoId: 'Uruguay vs Italia',
    precio: 900,
    sector: 'Platea Belgrano',
    estado: 'pendiente'
  },
  {
    id: '4',
    partidoId: 'España vs Países Bajos',
    precio: 1100,
    sector: 'Sívori Alta',
    estado: 'vendido'
  }
];
