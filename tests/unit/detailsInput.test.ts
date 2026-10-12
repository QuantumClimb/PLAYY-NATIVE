import { describe, expect, it } from 'vitest';
import { DETAIL_LIMITS, applyDetailKey } from '../../src/kiosk/flow/detailsInput';

const type = (field: 'name' | 'phone' | 'email', keys: string[], start = '') =>
  keys.reduce((text, key) => applyDetailKey(field, text, key) ?? text, start);

describe('name', () => {
  it('capitalises each word and lower-cases the rest', () => {
    expect(type('name', [...'aRJUN'])).toBe('Arjun');
    expect(type('name', [...'mary', ' ', ...'jane'])).toBe('Mary Jane');
    expect(type('name', [...'anne', '-', ...'marie'])).toBe('Anne-Marie');
  });
  it('ignores a leading or doubled space and characters it does not allow', () => {
    expect(applyDetailKey('name', '', ' ')).toBeNull();
    expect(applyDetailKey('name', 'Ann ', ' ')).toBeNull();
    expect(applyDetailKey('name', 'Ann', '@')).toBeNull();
  });
  it('stops at the limit', () => {
    expect(type('name', [...'a'.repeat(30)]).length).toBe(DETAIL_LIMITS.name);
  });
});

describe('phone', () => {
  it('takes digits, and a plus only first', () => {
    expect(type('phone', ['+', '9', '1', '+', '9'])).toBe('+919');
    expect(applyDetailKey('phone', '12', 'a')).toBeNull();
  });
  it('stops at the limit', () => {
    expect(type('phone', [...'1'.repeat(30)]).length).toBe(DETAIL_LIMITS.phone);
  });
});

describe('email', () => {
  it('lower-cases, refuses spaces and takes longer keys', () => {
    expect(type('email', ['J', 'O', '@', 'X', '.COM'])).toBe('jo@x.com');
    expect(applyDetailKey('email', 'jo', ' ')).toBeNull();
  });
});

describe('backspace', () => {
  it('removes the last character on every screen', () => {
    expect(applyDetailKey('name', 'Ann', 'BACKSPACE')).toBe('An');
    expect(applyDetailKey('phone', '12', 'BACKSPACE')).toBe('1');
    expect(applyDetailKey('email', '', 'BACKSPACE')).toBe('');
  });
});
