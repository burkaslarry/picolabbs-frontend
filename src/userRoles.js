/** Values stored in API `users.role` — must match backend UsersController. */
export const CRM_USER_ROLES = [
  'superadmin',
  'ops_front',
  'ops_back',
  'ops_reminder',
  'operator',
];

export function userRoleLabel(role, t, lang) {
  const key =
    role === 'superadmin'
      ? 'users.superadmin'
      : role === 'operator'
        ? 'users.operator'
        : role === 'ops_front'
          ? 'users.roleOpsFront'
          : role === 'ops_back'
            ? 'users.roleOpsBack'
            : role === 'ops_reminder'
              ? 'users.roleOpsReminder'
              : 'users.operator';
  const label = t(key, lang);
  return label.startsWith('users.') ? role : label;
}
