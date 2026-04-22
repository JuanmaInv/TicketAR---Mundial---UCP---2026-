import { Ticket } from '../types/ticket';

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    partidoId: 'Argentina vs Argelia',
    precio: 2000,
    sector: 'VIP - Arrowhead Stadium (Kansas City)',
    estado: 'disponible'
  },
  {
    id: '2',
    partidoId: 'Argentina vs Austria',
    precio: 7000,
    sector: 'Palco - AT&T Stadium (Arlington)',
    estado: 'disponible'
  },
  {
    id: '3',
    partidoId: 'Jordania vs Argentina',
    precio: 120,
    sector: 'Popular - AT&T Stadium (Arlington)',
    estado: 'disponible'
  }
];
