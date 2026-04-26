export class UsuarioEntidad {
  id: string; 
  email: string;
  nombre: string;
  apellido: string;
  numeroPasaporte: string; 
  telefono?: string;
  localidad?: string;
  provincia?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
