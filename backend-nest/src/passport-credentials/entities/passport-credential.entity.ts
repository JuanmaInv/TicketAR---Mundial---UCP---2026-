export class CredencialPasaporteEntidad {
  id: string; // UUID de Supabase
  idUsuario: string; // Relación con el Usuario
  numerodocumento: string; // Número de pasaporte (Requisito crítico)
  codigoPais: string; // Ej: AR, USA, BRA
  estaValidado: boolean; // Debe ser true para poder comprar una entrada
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
