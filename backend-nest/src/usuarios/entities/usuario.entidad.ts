export class UsuarioEntidad {
  id: string; // Puede ser un UUID proveniente de Supabase Auth
  email: string;
  nombre: string;
  apellido: string;
  numeroPasaporte: string; // Requisito crítico del proyecto: Entrada obligatoria con Pasaporte
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
