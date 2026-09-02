import { describe, expect, it } from 'vitest';

import { registerSchema } from '../register.schema';

const validData = {
  name: 'John Doe',
  email: 'John@Example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  companyName: 'Acme Inc',
  countryId: '1',
  secondary_website: '',
  terms: true,
};

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validData);

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('john@example.com');
  });

  it('requires name', () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: '',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Name must be at least 2 characters');
  });

  it('rejects names longer than 120 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: 'a'.repeat(121),
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Name must not exceed 120 characters');
  });

  it('trims the name', () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: '   John Doe   ',
    });

    expect(result.success).toBe(true);

    expect(result.data?.name).toBe('John Doe');
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Please enter a valid email address');
  });

  it('converts email to lowercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'JOHN@EXAMPLE.COM',
    });

    expect(result.success).toBe(true);

    expect(result.data?.email).toBe('john@example.com');
  });

  it('requires password length of at least 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Ab1!',
      confirmPassword: 'Ab1!',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Password must be at least 8 characters');
  });

  it('requires an uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password123!',
      confirmPassword: 'password123!',
    });

    expect(result.success).toBe(false);

    expect(
      result.error?.issues.some(
        (issue) => issue.message === 'Password must contain at least one uppercase letter',
      ),
    ).toBe(true);
  });

  it('requires a lowercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PASSWORD123!',
      confirmPassword: 'PASSWORD123!',
    });

    expect(result.success).toBe(false);

    expect(
      result.error?.issues.some(
        (issue) => issue.message === 'Password must contain at least one lowercase letter',
      ),
    ).toBe(true);
  });

  it('requires a number', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password!',
      confirmPassword: 'Password!',
    });

    expect(result.success).toBe(false);

    expect(
      result.error?.issues.some(
        (issue) => issue.message === 'Password must contain at least one number',
      ),
    ).toBe(true);
  });

  it('requires a special character', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(result.success).toBe(false);

    expect(
      result.error?.issues.some(
        (issue) => issue.message === 'Password must contain at least one special character',
      ),
    ).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'Different123!',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
    expect(result.error?.issues[0]?.message).toBe("Passwords don't match");
  });

  it('requires company name', () => {
    const result = registerSchema.safeParse({
      ...validData,
      companyName: '',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Company name must be at least 2 characters');
  });

  it('rejects company names longer than 160 characters', () => {
    const result = registerSchema.safeParse({
      ...validData,
      companyName: 'a'.repeat(161),
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Company name must not exceed 160 characters');
  });

  it('requires country selection', () => {
    const result = registerSchema.safeParse({
      ...validData,
      countryId: '',
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('Please select a country');
  });

  it('requires terms to be accepted', () => {
    const result = registerSchema.safeParse({
      ...validData,
      terms: false,
    });

    expect(result.success).toBe(false);

    expect(result.error?.issues[0]?.message).toBe('You must accept the terms and conditions');
  });

  it('allows omitted secondary_website', () => {
    // delete secondary_website from validData to simulate omission
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    const { secondary_website, ...data } = { ...validData };

    const result = registerSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('accepts secondary_website when provided', () => {
    const result = registerSchema.safeParse({
      ...validData,
      secondary_website: 'https://example.com',
    });

    expect(result.success).toBe(true);

    expect(result.data?.secondary_website).toBe('https://example.com');
  });

  it('trims password fields', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: ' Password123! ',
      confirmPassword: ' Password123! ',
    });

    expect(result.success).toBe(true);

    expect(result.data?.password).toBe('Password123!');
    expect(result.data?.confirmPassword).toBe('Password123!');
  });
});
