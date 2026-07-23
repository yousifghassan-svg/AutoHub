import { otpSchema, phoneSchema, displayNameSchema } from '../domain/schemas';

describe('auth schemas', () => {
  it('accepts Iraq E.164 phones', () => {
    expect(phoneSchema.parse('+9647501234567')).toBe('+9647501234567');
    expect(phoneSchema.parse('+964 750 123 4567')).toBe('+9647501234567');
  });

  it('rejects invalid phones', () => {
    expect(() => phoneSchema.parse('07501234567')).toThrow();
    expect(() => phoneSchema.parse('+1')).toThrow();
  });

  it('validates OTP as 6 digits', () => {
    expect(otpSchema.parse('123456')).toBe('123456');
    expect(() => otpSchema.parse('12345')).toThrow();
    expect(() => otpSchema.parse('abcdef')).toThrow();
  });

  it('validates display names', () => {
    expect(displayNameSchema.parse('  Ali  ')).toBe('Ali');
    expect(() => displayNameSchema.parse('A')).toThrow();
  });
});
