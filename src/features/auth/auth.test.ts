import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas';

describe('auth schemas', () => {
  it('login requires a valid email and a non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: '' }).success).toBe(false);
  });

  it('register enforces the 10-char backend password minimum', () => {
    expect(
      registerSchema.safeParse({ email: 'ada@example.com', password: 'short', name: '' }).success,
    ).toBe(false);
    const parsed = registerSchema.safeParse({
      email: 'ada@example.com',
      password: 'correct-horse-battery-staple-42',
      name: '',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBeUndefined();
    }
  });
});
