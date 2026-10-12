import { describe, expect, it } from 'vitest';
import { moveItem } from '../../src/lib/list';
import { Submission, matchesQuery, submissionsToCsv } from '../../src/command-center/submissions';

const row = (over: Partial<Submission> = {}): Submission => ({
  id: 1,
  created: '2026-10-12T09:00:00.000Z',
  name: 'Arjun',
  email: 'arjun@example.com',
  phone: '9876543210',
  thumbnail: null,
  config: {
    head: 'playy',
    pose: 'pose1',
    symbol: 'warm-heart',
    background: 'background-01',
    colors: { main: '#ff0000' },
  },
  email_status: 'sent',
  email_error: null,
  ...over,
});

describe('moveItem', () => {
  it('moves an item up or down and leaves the original alone', () => {
    const list = ['a', 'b', 'c'];
    expect(moveItem(list, 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(list, 1, 1)).toEqual(['a', 'c', 'b']);
    expect(list).toEqual(['a', 'b', 'c']);
  });
  it('does nothing past the ends', () => {
    const list = ['a', 'b'];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 1)).toBe(list);
  });
});

describe('matchesQuery', () => {
  it('searches name, email and phone, ignoring case', () => {
    expect(matchesQuery(row(), 'ARJ')).toBe(true);
    expect(matchesQuery(row(), 'example.com')).toBe(true);
    expect(matchesQuery(row(), '98765')).toBe(true);
    expect(matchesQuery(row(), 'zzz')).toBe(false);
    expect(matchesQuery(row(), '  ')).toBe(true);
  });
});

describe('submissionsToCsv', () => {
  it('writes a header and one quoted line per row, with a byte-order mark', () => {
    const csv = submissionsToCsv([row(), row({ id: 2, name: 'Say "hi"', email_status: 'failed' })]);
    const lines = csv.split('\r\n');
    expect(csv.startsWith('﻿"Date and time"')).toBe(true);
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"Arjun"');
    expect(lines[1]).toContain('"Emailed"');
    expect(lines[2]).toContain('"Say ""hi"""');
    expect(lines[2]).toContain('"Not sent"');
  });
});
