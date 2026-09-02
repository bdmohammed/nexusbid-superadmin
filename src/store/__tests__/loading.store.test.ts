import { beforeEach, describe, expect, it } from 'vitest';

import { useLoadingStore } from '../loading.store';

describe('useLoadingStore', () => {
  beforeEach(() => {
    useLoadingStore.getState().reset();
  });

  it('has the initial state', () => {
    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.message).toBeNull();
  });

  it('shows loading with default message', () => {
    useLoadingStore.getState().show();

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(true);
    expect(state.message).toBe('');
  });

  it('shows loading with custom message', () => {
    useLoadingStore.getState().show('Loading users...');

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(true);
    expect(state.message).toBe('Loading users...');
  });

  it('hides loading', () => {
    useLoadingStore.getState().show('Loading...');

    useLoadingStore.getState().hide();

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.message).toBeNull();
  });

  it('sets loading to true with message', () => {
    useLoadingStore.getState().setLoading(true, 'Saving...');

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(true);
    expect(state.message).toBe('Saving...');
  });

  it('sets loading to true without message', () => {
    useLoadingStore.getState().setLoading(true);

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(true);
    expect(state.message).toBeNull();
  });

  it('sets loading to false with message', () => {
    useLoadingStore.getState().setLoading(false, 'Finished');

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.message).toBe('Finished');
  });

  it('resets the store', () => {
    useLoadingStore.getState().show('Loading...');

    useLoadingStore.getState().reset();

    const state = useLoadingStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.message).toBeNull();
  });

  it('can transition through multiple states', () => {
    const store = useLoadingStore.getState();

    store.show('Fetching...');
    expect(useLoadingStore.getState().isLoading).toBe(true);
    expect(useLoadingStore.getState().message).toBe('Fetching...');

    store.setLoading(false, 'Done');
    expect(useLoadingStore.getState().isLoading).toBe(false);
    expect(useLoadingStore.getState().message).toBe('Done');

    store.reset();
    expect(useLoadingStore.getState().isLoading).toBe(false);
    expect(useLoadingStore.getState().message).toBeNull();
  });
});
