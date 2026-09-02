import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from '../theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.getState().reset();

    localStorage.clear();
    document.documentElement.className = '';

    vi.restoreAllMocks();

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  it('has the initial state', () => {
    const state = useThemeStore.getState();

    expect(state.theme).toBe('system');
    expect(state.mounted).toBe(false);
  });

  it('initializes with light system theme when no persisted value exists', () => {
    useThemeStore.getState().initialize();

    const state = useThemeStore.getState();

    expect(state.theme).toBe('light');
    expect(state.mounted).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initializes with dark system theme', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
      })),
    );

    useThemeStore.getState().initialize();

    const state = useThemeStore.getState();

    expect(state.theme).toBe('dark');
    expect(state.mounted).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('uses persisted theme', () => {
    localStorage.setItem(
      'theme-storage',
      JSON.stringify({
        state: {
          theme: 'dark',
        },
        version: 0,
      }),
    );

    useThemeStore.setState({
      ...useThemeStore.getState(),
      theme: 'dark',
    });

    useThemeStore.getState().initialize();

    expect(useThemeStore.getState().mounted).toBe(true);
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets theme to dark', () => {
    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets theme to light', () => {
    useThemeStore.getState().setTheme('light');

    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles light to dark', () => {
    const store = useThemeStore.getState();

    store.setTheme('light');
    store.toggleTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles dark to light', () => {
    const store = useThemeStore.getState();

    store.setTheme('dark');
    store.toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('resets the store', () => {
    const store = useThemeStore.getState();

    store.setTheme('dark');
    store.initialize();

    store.reset();

    const state = useThemeStore.getState();

    expect(state.theme).toBe('system');
    expect(state.mounted).toBe(false);
  });

  it('persists only the theme', () => {
    useThemeStore.getState().setTheme('dark');

    const persisted = JSON.parse(localStorage.getItem('theme-storage')!);

    expect(persisted.state).toEqual({
      theme: 'dark',
    });

    expect(persisted.state.mounted).toBeUndefined();
  });

  it('supports multiple state transitions', () => {
    const store = useThemeStore.getState();

    store.setTheme('light');
    store.toggleTheme();
    store.toggleTheme();

    expect(useThemeStore.getState().theme).toBe('light');

    store.reset();

    expect(useThemeStore.getState()).toMatchObject({
      theme: 'system',
      mounted: false,
    });
  });
});
