import { Role } from '@prisma/client';

export enum Permission {
  // User profile permissions
  READ_OWN_PROFILE = 'read:own:profile',
  UPDATE_OWN_PROFILE = 'update:own:profile',
  DELETE_OWN_PROFILE = 'delete:own:profile',

  // Check-in permissions
  CREATE_OWN_CHECKIN = 'create:own:checkin',
  READ_OWN_CHECKIN = 'read:own:checkin',
  UPDATE_OWN_CHECKIN = 'update:own:checkin',
  DELETE_OWN_CHECKIN = 'delete:own:checkin',

  // Report permissions
  READ_OWN_REPORTS = 'read:own:reports',

  // Article permissions
  CREATE_ARTICLE = 'create:article',
  UPDATE_ARTICLE = 'update:article',
  DELETE_ARTICLE = 'delete:article',
  READ_ALL_ARTICLES = 'read:all:articles',

  // Admin permissions
  READ_ALL_USERS = 'read:all:users',
  CREATE_USER = 'create:user',
  UPDATE_ANY_USER = 'update:any:user',
  DELETE_ANY_USER = 'delete:any:user',
  READ_ALL_CHECKINS = 'read:all:checkins',
  UPDATE_ANY_CHECKIN = 'update:any:checkin',
  DELETE_ANY_CHECKIN = 'delete:any:checkin',
  READ_ALL_REPORTS = 'read:all:reports',
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.DELETE_OWN_PROFILE,
    Permission.CREATE_OWN_CHECKIN,
    Permission.READ_OWN_CHECKIN,
    Permission.UPDATE_OWN_CHECKIN,
    Permission.DELETE_OWN_CHECKIN,
    Permission.READ_OWN_REPORTS,
  ],

  [Role.ADMIN]: [
    ...Object.values(Permission),
  ],
};

// Simple check - single role
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return rolePermissions[role].includes(permission);
};

// Get all permissions for a role
export const getPermissionsByRole = (role: Role): Permission[] => {
  return rolePermissions[role];
};
