export const ADMIN_ROLES = {
  admin: 'admin',
  superAdmin: 'super_admin',
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];
