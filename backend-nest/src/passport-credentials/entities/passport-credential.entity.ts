export class PassportCredentialEntity {
  id: string; // UUID
  userId: string; // Relation to User
  documentNumber: string; // Required logic
  countryCode: string;
  isValidated: boolean; // Must be true to buy ticket
  createdAt: Date;
  updatedAt: Date;
}
