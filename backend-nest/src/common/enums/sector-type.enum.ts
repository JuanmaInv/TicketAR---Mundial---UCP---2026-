/**
 * Única fuente de verdad para los Sectores del Estadio (Principio DRY).
 * Al centralizarlo aquí, si la regla de negocio cambia (ej. se agrega un sector 'VIP'),
 * todos los módulos (Tickets, Estadios, Reventa) se actualizan automáticamente.
 * Esto previene bugs críticos por desincronización entre módulos.
 */
export enum SectorType {
  PLATEA = 'PLATEA',
  PALCO = 'PALCO',
  POPULAR = 'POPULAR',
  PRENSA = 'PRENSA',
}
