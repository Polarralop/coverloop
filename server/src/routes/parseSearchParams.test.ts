import { describe, it, expect } from 'vitest';
import type { Request } from 'express';
import { parseSearchParams } from './albums';

// parseSearchParams only reads req.query, so a bare object stands in for Request.
function reqWith(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

describe('parseSearchParams', () => {
  describe('term', () => {
    it('rejects a missing term', () => {
      expect(parseSearchParams(reqWith({}))).toEqual({ error: 'term is required' });
    });

    it('rejects an empty term', () => {
      expect(parseSearchParams(reqWith({ term: '' }))).toEqual({ error: 'term is required' });
    });

    it('rejects a whitespace-only term', () => {
      expect(parseSearchParams(reqWith({ term: '   ' }))).toEqual({ error: 'term is required' });
    });

    it('rejects a repeated term (?term=a&term=b arrives as an array)', () => {
      expect(parseSearchParams(reqWith({ term: ['a', 'b'] }))).toEqual({ error: 'term is required' });
    });

    it('trims the term', () => {
      expect(parseSearchParams(reqWith({ term: '  zelda  ' }))).toEqual({ term: 'zelda', limit: 40 });
    });
  });

  describe('limit', () => {
    const withTerm = (limit: unknown) => reqWith({ term: 'zelda', limit });

    it('defaults to 40 when omitted', () => {
      expect(parseSearchParams(withTerm(undefined))).toEqual({ term: 'zelda', limit: 40 });
    });

    it('rejects non-numeric limits', () => {
      expect(parseSearchParams(withTerm('abc'))).toEqual({ error: 'limit must be a whole number' });
    });

    it('rejects fractional limits (would produce invalid IGDB queries)', () => {
      expect(parseSearchParams(withTerm('1.5'))).toEqual({ error: 'limit must be a whole number' });
    });

    it('accepts "2.0" — numerically an integer', () => {
      expect(parseSearchParams(withTerm('2.0'))).toEqual({ term: 'zelda', limit: 2 });
    });

    it('rejects limits above 50', () => {
      expect(parseSearchParams(withTerm('99'))).toEqual({ error: 'limit must be between 1-50' });
    });

    it('rejects limits below 1', () => {
      expect(parseSearchParams(withTerm('0'))).toEqual({ error: 'limit must be between 1-50' });
    });

    it('accepts the 1 and 50 boundaries', () => {
      expect(parseSearchParams(withTerm('1'))).toEqual({ term: 'zelda', limit: 1 });
      expect(parseSearchParams(withTerm('50'))).toEqual({ term: 'zelda', limit: 50 });
    });

    it('rejects an empty-string limit (Number("") is 0, out of range)', () => {
      expect(parseSearchParams(withTerm(''))).toEqual({ error: 'limit must be between 1-50' });
    });

    it('rejects Infinity', () => {
      expect(parseSearchParams(withTerm('Infinity'))).toEqual({ error: 'limit must be a whole number' });
    });
  });
});
