import { describe, expect, it } from 'vitest';
import { hasMinRole, canAccessUniversity, canAuthorContent } from '../src/lib/roles';

describe('hasMinRole', () => {
  it('accepts a role at or above the required rank', () => {
    expect(hasMinRole('TEACHER', 'TEACHER')).toBe(true);
    expect(hasMinRole('PORTAL_ADMIN', 'TEACHER')).toBe(true);
  });

  it('rejects a role below the required rank', () => {
    expect(hasMinRole('STUDENT', 'TEACHER')).toBe(false);
    expect(hasMinRole('VIEWER', 'TEACHER')).toBe(false);
  });

  it('rejects missing or unknown roles', () => {
    expect(hasMinRole(undefined, 'TEACHER')).toBe(false);
    expect(hasMinRole('NOT_A_ROLE', 'TEACHER')).toBe(false);
  });
});

describe('canAccessUniversity', () => {
  it('is bundled access — any TEACHER+ account qualifies', () => {
    expect(canAccessUniversity({ role: 'TEACHER' })).toBe(true);
    expect(canAccessUniversity({ role: 'PORTAL_ADMIN' })).toBe(true);
    expect(canAccessUniversity({ role: 'STUDENT' })).toBe(false);
    expect(canAccessUniversity(null)).toBe(false);
  });
});

describe('canAuthorContent', () => {
  it('matches requireContentWrite() on the server: PORTAL_ADMIN+ or ACME_CREATOR', () => {
    expect(canAuthorContent({ role: 'PORTAL_ADMIN' })).toBe(true);
    expect(canAuthorContent({ role: 'SUPER_ADMIN' })).toBe(true);
    expect(canAuthorContent({ role: 'ACME_CREATOR' })).toBe(true);
    expect(canAuthorContent({ role: 'TEACHER' })).toBe(false);
  });
});
