export class UserEntity {
  id: string; // Puede ser un UUID proveniente de Supabase Auth
  email: string;
  firstName: string;
  lastName: string;
  passportNumber: string; // Requisito crítico del proyecto: Entrada obligatoria con Pasaporte
  createdAt: Date;
  updatedAt: Date;
}
