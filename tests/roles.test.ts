import { describe, expect, it } from 'vitest';
import { hasMinRole, canAccessUniversity, canAuthorContent, canAssignTraining } from '../src/lib/roles';

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

  it('treats district and school staff as educators', () => {
    expect(canAccessUniversity({ role: 'DISTRICT_USER' })).toBe(true);
    expect(canAccessUniversity({ role: 'SCHOOL_USER' })).toBe(true);
  });
});

describe('canAssignTraining', () => {
  it('allows platform and district admins, plus school/teacher ADMIN subtype', () => {
    expect(canAssignTraining({ role: 'PORTAL_ADMIN' })).toBe(true);
    expect(canAssignTraining({ role: 'DISTRICT_USER' })).toBe(true);
    expect(canAssignTraining({ role: 'SCHOOL_USER', roleSubtype: 'ADMIN' })).toBe(true);
    expect(canAssignTraining({ role: 'TEACHER', roleSubtype: 'ADMIN' })).toBe(true);
    expect(canAssignTraining({ role: 'TEACHER', roleSubtype: 'NONE' })).toBe(false);
    expect(canAssignTraining({ role: 'SCHOOL_USER', roleSubtype: 'NONE' })).toBe(false);
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
