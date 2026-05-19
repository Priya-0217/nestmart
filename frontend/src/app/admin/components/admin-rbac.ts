import type { UserRole } from '@/lib/constants/roles';

export const ADMIN_PANEL_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPORT: 'support'
} as const;

export type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[keyof typeof ADMIN_PANEL_ROLES];

export type AdminPermission =
  | 'dashboard:view'
  | 'products:write'
  | 'products:import'
  | 'categories:write'
  | 'orders:write'
  | 'orders:invoice'
  | 'customers:write'
  | 'coupons:write'
  | 'inventory:view'
  | 'reports:view'
  | 'cms:write'
  | 'reviews:moderate';

const ROLE_PERMISSIONS: Record<AdminPanelRole, ReadonlyArray<AdminPermission>> = {
  admin: [
    'dashboard:view',
    'products:write',
    'products:import',
    'categories:write',
    'orders:write',
    'orders:invoice',
    'customers:write',
    'coupons:write',
    'inventory:view',
    'reports:view',
    'cms:write',
    'reviews:moderate'
  ],
  manager: [
    'dashboard:view',
    'products:write',
    'products:import',
    'categories:write',
    'orders:write',
    'orders:invoice',
    'customers:write',
    'coupons:write',
    'inventory:view',
    'reports:view',
    'reviews:moderate'
  ],
  support: [
    'dashboard:view',
    'orders:write',
    'orders:invoice',
    'customers:write',
    'inventory:view',
    'reports:view',
    'reviews:moderate'
  ]
};

export function normalizeAdminRole(role: UserRole | string | undefined | null): AdminPanelRole | null {
  if (!role) return null;
  const normalized = String(role).toLowerCase();
  if (normalized === 'admin') return ADMIN_PANEL_ROLES.ADMIN;
  if (normalized === 'manager') return ADMIN_PANEL_ROLES.MANAGER;
  if (normalized === 'support') return ADMIN_PANEL_ROLES.SUPPORT;
  return null;
}

export function isAdminPanelRole(role: UserRole | string | undefined | null): boolean {
  return normalizeAdminRole(role) !== null;
}

export function canAccess(permission: AdminPermission, role: UserRole | string | undefined | null): boolean {
  const normalizedRole = normalizeAdminRole(role);
  if (!normalizedRole) return false;
  return ROLE_PERMISSIONS[normalizedRole].includes(permission);
}
