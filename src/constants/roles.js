// Centralized role constants for the application
export const ROLES = {
  ADMIN: 'admin',
  LEADER: 'leader',
  DEVELOPER: 'developer',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const USER_ROLES = [ROLES.ADMIN, ROLES.LEADER, ROLES.DEVELOPER, ROLES.VIEWER];
export const MEMBER_ROLES = [ROLES.LEADER, ROLES.DEVELOPER, ROLES.MEMBER, ROLES.VIEWER];

export default { ROLES, USER_ROLES, MEMBER_ROLES };
