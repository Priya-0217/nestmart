export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SUPPORT: "SUPPORT"
} as const;

export type UserRole =
  | (typeof USER_ROLES)[keyof typeof USER_ROLES]
  | "customer"
  | "admin"
  | "manager"
  | "support";

export const ADMIN_ROLES: UserRole[] = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SUPPORT, "admin", "manager", "support"];
