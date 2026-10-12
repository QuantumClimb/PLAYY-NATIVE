import { describe, expect, it } from 'vitest';
import { detailProblem, isEmail, isHexColor, isPhone, phoneDigits } from '../../shared/validation.mjs';

describe('isHexColor', () => {
  it('accepts six-digit hex only', () => {
    expect(isHexColor('#14246e')).toBe(true);
    expect(isHexColor('#ABCDEF')).toBe(true);
    expect(isHexColor('#abc')).toBe(false);
    expect(isHexColor('red')).toBe(false);
    expect(isHexColor(undefined)).toBe(false);
  });
});

describe('isEmail', () => {
  it('accepts ordinary addresses and rejects the rest', () => {
    expect(isEmail('name@example.com')).toBe(true);
    expect(isEmail(' name@example.co.in ')).toBe(true);
    expect(isEmail('name@example')).toBe(false);
    expect(isEmail('name example@x.com')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});

describe('phone', () => {
  it('counts digits only', () => {
    expect(phoneDigits('+91 98765-43210')).toBe('919876543210');
    expect(isPhone('+91 98765-43210')).toBe(true);
    expect(isPhone('12345')).toBe(false);
  });
});

describe('detailProblem', () => {
  it('is empty when the answer is fine', () => {
    expect(detailProblem('name', 'Arjun')).toBe('');
    expect(detailProblem('phone', '9876543210')).toBe('');
    expect(detailProblem('email', 'a@b.com')).toBe('');
  });
  it('explains what is wrong', () => {
    expect(detailProblem('name', '  ')).toBe('Please type your name.');
    expect(detailProblem('phone', '123')).toContain('at least 7 digits');
    expect(detailProblem('email', 'nope')).toContain('valid email');
  });
});
