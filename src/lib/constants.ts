/** Formatea un número entero como precio en COP. Ej: 12000 → "$12.000" */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Valida que un username solo contenga letras, números y guiones bajos */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

/** Key de localStorage para guardar el username */
export const USERNAME_STORAGE_KEY = "breakfasthub_username";

/** Key de localStorage para guardar el userId */
export const USERID_STORAGE_KEY = "breakfasthub_userid";

/** Key de sessionStorage para guardar auth del admin */
export const ADMIN_AUTH_STORAGE_KEY = "breakfasthub_admin_auth";
