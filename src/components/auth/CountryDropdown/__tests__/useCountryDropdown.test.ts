import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CountryItem, useCountryDropdown } from '../useCountryDropdown';

const countries: CountryItem[] = [
  {
    countryId: '1',
    countryName: 'India',
    countryCode: 'IN',
  },
  {
    countryId: '2',
    countryName: 'United States',
    countryCode: 'US',
  },
  {
    countryId: '3',
    countryName: 'Canada',
    countryCode: 'CA',
  },
];

describe('useCountryDropdown', () => {
  const onChange = vi.fn();
  const onBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default initial state', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries: undefined,
        onChange,
        onBlur,
      }),
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedCountry).toBeUndefined();
    expect(result.current.filteredCountries).toEqual([]);
    expect(result.current.dropdownRef.current).toBeNull();
  });

  it('selects matching country from value', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '2',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(result.current.selectedCountry).toEqual(countries[1]);
  });

  it('returns undefined when selected country does not exist', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '999',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(result.current.selectedCountry).toBeUndefined();
  });

  it('calls onChange with first country when value is empty', () => {
    renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('does not auto-select when value already exists', () => {
    renderHook(() =>
      useCountryDropdown({
        value: '3',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not auto-select when countries are undefined', () => {
    renderHook(() =>
      useCountryDropdown({
        value: '',
        countries: undefined,
        onChange,
        onBlur,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not auto-select when countries array is empty', () => {
    renderHook(() =>
      useCountryDropdown({
        value: '',
        countries: [],
        onChange,
        onBlur,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it('filters countries using search term', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setSearchTerm('india');
    });

    expect(result.current.filteredCountries).toEqual([countries[0]]);
  });

  it('filters countries case-insensitively', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setSearchTerm('UNITED');
    });

    expect(result.current.filteredCountries).toEqual([countries[1]]);
  });

  it('returns empty array when search has no matches', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setSearchTerm('xyz');
    });

    expect(result.current.filteredCountries).toEqual([]);
  });

  it('returns all countries when search term is empty', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(result.current.filteredCountries).toEqual(countries);
  });

  it('opens and closes dropdown using setIsOpen', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('handleSelect updates value, closes dropdown, clears search and triggers blur', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setIsOpen(true);
      result.current.setSearchTerm('ind');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.searchTerm).toBe('ind');

    act(() => {
      result.current.handleSelect('2');
    });

    expect(onChange).toHaveBeenLastCalledWith('2');
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchTerm).toBe('');
  });

  it('handleSelect accepts numeric country ids', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.handleSelect(123);
    });

    expect(onChange).toHaveBeenLastCalledWith('123');
  });

  it.todo('closes dropdown when clicking outside', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
        }),
      );
    });

    expect(result.current.isOpen).toBe(false);

    outside.remove();
  });

  it('does not close when dropdown ref is null', () => {
    const { result } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    act(() => {
      result.current.setIsOpen(true);
    });

    act(() => {
      document.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
        }),
      );
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('removes document event listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useCountryDropdown({
        value: '',
        countries,
        onChange,
        onBlur,
      }),
    );

    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
