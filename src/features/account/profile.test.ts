import { describe, expect, it } from 'vitest';
import { profileUpdateSchema } from './schemas';

describe('profileUpdateSchema', () => {
  it('accepts a name-only update (empty passwords mean no change)', () => {
    const parsed = profileUpdateSchema.safeParse({
      name: 'Ada Lovelace',
      password: '',
      confirmPassword: '',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a matching new password with its confirmation', () => {
    const parsed = profileUpdateSchema.safeParse({
      name: 'Ada Lovelace',
      password: 'correct-horse-battery-staple-42',
      confirmPassword: 'correct-horse-battery-staple-42',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a password without a matching confirmation', () => {
    const parsed = profileUpdateSchema.safeParse({
      name: 'Ada Lovelace',
      password: 'correct-horse-battery-staple-42',
      confirmPassword: 'something-else-entirely',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path[0]).toBe('confirmPassword');
    }
  });

  it('rejects a short new password', () => {
    const parsed = profileUpdateSchema.safeParse({
      name: 'Ada Lovelace',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(
      profileUpdateSchema.safeParse({ name: '   ', password: '', confirmPassword: '' }).success,
    ).toBe(false);
  });
});
