import type { UserRole } from "@/types";

type Permission =
  | "dashboard:view"
  | "appointments:view"
  | "appointments:manage"
  | "appointments:assign"
  | "leads:view"
  | "leads:manage"
  | "leads:view_all"
  | "sales:view"
  | "sales:create"
  | "sales:view_all"
  | "sales:export"
  | "inventory:view"
  | "inventory:manage"
  | "inventory:publish"
  | "team:view"
  | "team:manage"
  | "mail:view"
  | "mail:send"
  | "mail:view_all"
  | "calendar:view"
  | "calendar:manage"
  | "calendar:view_all"
  | "logs:view"
  | "reports:view"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "dashboard:view",
    "appointments:view", "appointments:manage", "appointments:assign",
    "leads:view", "leads:manage", "leads:view_all",
    "sales:view", "sales:create", "sales:view_all", "sales:export",
    "inventory:view", "inventory:manage", "inventory:publish",
    "team:view", "team:manage",
    "mail:view", "mail:send", "mail:view_all",
    "calendar:view", "calendar:manage", "calendar:view_all",
    "logs:view",
    "reports:view",
    "settings:manage",
  ],
  ADMIN: [
    "dashboard:view",
    "appointments:view", "appointments:manage", "appointments:assign",
    "leads:view", "leads:manage", "leads:view_all",
    "sales:view", "sales:view_all",
    "inventory:view", "inventory:manage", "inventory:publish",
    "team:view",
    "mail:view", "mail:send", "mail:view_all",
    "calendar:view", "calendar:manage", "calendar:view_all",
    "logs:view",
    "reports:view",
  ],
  SALES: [
    "dashboard:view",
    "appointments:view", "appointments:manage",
    "leads:view", "leads:manage",
    "sales:view", "sales:create",
    "inventory:view",
    "mail:view", "mail:send",
    "calendar:view",
  ],
  VIEWER: [
    "dashboard:view",
    "appointments:view",
    "leads:view",
    "sales:view",
    "inventory:view",
    "calendar:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Yetkiniz yok: ${permission}`);
  }
}

export type { Permission };
