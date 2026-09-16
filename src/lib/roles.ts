// Small pure-function role-rank comparator — mirrors the ladder in
// walkr-ecko-server/src/roles.js and wlkr-ed-portal/src/lib/roles.ts. Kept
// minimal here since WLKR University only needs a single "is this an
// educator account" gate (bundled access — no district/school scoping).

export const ROLE_RANK = [
  'VIEWER',
  'USER',
  'STUDENT',
  'PARENT',
  'USER_GUARDIAN',
  'TEACHER',
  'SALES',
  'SUPPORT',
  'SALES_SUPPORT',
  'EXTERNAL_CONTRACTOR',
  'ACME_CREATOR',
  'PORTAL_ADMIN',
  'SUPER_ADMIN',
] as const;

export type EckoRole = (typeof ROLE_RANK)[number];

function rankOf(role: string): number {
  return ROLE_RANK.indexOf(role as EckoRole);
}

export function hasMinRole(userRole: string | undefined | null, requiredRole: EckoRole): boolean {
  if (!userRole) return false;
  const userRank = rankOf(userRole);
  const requiredRank = rankOf(requiredRole);
  if (userRank < 0 || requiredRank < 0) return false;
  return userRank >= requiredRank;
}

/** Bundled access: any TEACHER+ WLKR account can use WLKR University. */
export function canAccessUniversity(
  user: { role?: string } | null | undefined,
): boolean {
  return hasMinRole(user?.role, 'TEACHER');
}

/** Course/lesson/quiz/article authoring — mirrors requireContentWrite() on
 * the server (PORTAL_ADMIN+ or ACME_CREATOR). */
export function canAuthorContent(
  user: { role?: string } | null | undefined,
): boolean {
  return user?.role === 'ACME_CREATOR' || hasMinRole(user?.role, 'PORTAL_ADMIN');
}
