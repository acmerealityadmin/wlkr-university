import { describe, expect, it } from 'vitest';
import { universityCleverCallbackUrl } from '../src/lib/clever-login';

describe('universityCleverCallbackUrl', () => {
  it('builds the locale-prefixed static-export callback', () => {
    expect(universityCleverCallbackUrl('http://localhost:3200', 'en')).toBe(
      'http://localhost:3200/en/login/callback/',
    );
    expect(universityCleverCallbackUrl('https://university.wlkr.ai/', 'es')).toBe(
      'https://university.wlkr.ai/es/login/callback/',
    );
  });
});
