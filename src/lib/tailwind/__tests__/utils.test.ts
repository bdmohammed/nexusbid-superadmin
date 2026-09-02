import { describe, expect, it } from 'vitest';

import { cn } from '../utils';

describe('cn', () => {
  it('returns an empty string with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('joins class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('ignores falsy values', () => {
    expect(
      cn(
        'px-4',
        false,
        null,
        undefined,
        '',
        0,
        'py-2',
      ),
    ).toBe('px-4 py-2');
  });

  it('supports conditional object syntax', () => {
    expect(
      cn({
        hidden: false,
        block: true,
        active: true,
      }),
    ).toBe('block active');
  });

  it('supports arrays', () => {
    expect(
      cn([
        'px-4',
        'py-2',
      ]),
    ).toBe('px-4 py-2');
  });

  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps non-conflicting Tailwind classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('merges complex Tailwind conflicts', () => {
    expect(
      cn(
        'bg-red-500',
        'bg-blue-500',
        'text-sm',
        'text-lg',
      ),
    ).toBe('bg-blue-500 text-lg');
  });

  it('supports mixed inputs', () => {
    expect(
      cn(
        'flex',
        ['items-center'],
        {
          hidden: false,
          block: true,
        },
        undefined,
        'justify-center',
      ),
    ).toBe('items-center block justify-center');
  });
});
