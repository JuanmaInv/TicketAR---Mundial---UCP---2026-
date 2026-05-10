/**
 * Única fuente de verdad para los Roles del Sistema (Principio DRY).
 * Esto evita errores como 'cliente1' o 'admin'. Solo estos valores son válidos
 * tanto en el Backend como en la Base de Datos (CHECK constraint).
 */
export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  CLIENTE = 'CLIENTE',
}
