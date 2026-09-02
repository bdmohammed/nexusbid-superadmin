import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModalStore } from '../modal.store';

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.getState().reset();
  });

  it('has the initial state', () => {
    const state = useModalStore.getState();

    expect(state.modal).toBeNull();
    expect(state.isOpen).toBe(false);
    expect(state.data).toBeNull();
  });

  it('opens a modal without data', () => {
    useModalStore.getState().open('create-user');

    const state = useModalStore.getState();

    expect(state.modal).toBe('create-user');
    expect(state.isOpen).toBe(true);
    expect(state.data).toBeUndefined();
  });

  it('opens edit-user modal with payload', () => {
    useModalStore.getState().open('edit-user', {
      id: '123',
    });

    const state = useModalStore.getState();

    expect(state.modal).toBe('edit-user');
    expect(state.isOpen).toBe(true);
    expect(state.data).toEqual({
      id: '123',
    });
  });

  it('opens assign-role modal', () => {
    useModalStore.getState().open('assign-role', {
      userId: 'user-1',
    });

    expect(useModalStore.getState().data).toEqual({
      userId: 'user-1',
    });
  });

  it('opens confirm modal', () => {
    const onConfirm = vi.fn();

    useModalStore.getState().open('confirm', {
      title: 'Delete User',
      description: 'Are you sure?',
      onConfirm,
    });

    const state = useModalStore.getState();

    expect(state.modal).toBe('confirm');
    expect(state.isOpen).toBe(true);
    expect(state.data).toEqual({
      title: 'Delete User',
      description: 'Are you sure?',
      onConfirm,
    });
  });

  it('opens custom modal', () => {
    const payload = {
      anything: true,
      nested: {
        value: 42,
      },
    };

    useModalStore.getState().open('custom', payload);

    expect(useModalStore.getState().data).toEqual(payload);
  });

  it('updates modal data', () => {
    useModalStore.getState().open('edit-user', {
      id: '1',
    });

    useModalStore.getState().setData({
      id: '2',
    });

    expect(useModalStore.getState().data).toEqual({
      id: '2',
    });
  });

  it('sets data to null', () => {
    useModalStore.getState().open('edit-user', {
      id: '1',
    });

    useModalStore.getState().setData(null);

    expect(useModalStore.getState().data).toBeNull();
  });

  it('closes the modal', () => {
    useModalStore.getState().open('delete-user', {
      id: '10',
    });

    useModalStore.getState().close();

    const state = useModalStore.getState();

    expect(state.modal).toBeNull();
    expect(state.isOpen).toBe(false);
    expect(state.data).toBeNull();
  });

  it('resets the store', () => {
    useModalStore.getState().open('assign-role', {
      userId: 'abc',
    });

    useModalStore.getState().reset();

    const state = useModalStore.getState();

    expect(state.modal).toBeNull();
    expect(state.isOpen).toBe(false);
    expect(state.data).toBeNull();
  });

  it('supports multiple state transitions', () => {
    const store = useModalStore.getState();

    store.open('edit-role', {
      id: 'role-1',
    });

    expect(useModalStore.getState().modal).toBe('edit-role');

    store.setData({
      id: 'role-2',
    });

    expect(useModalStore.getState().data).toEqual({
      id: 'role-2',
    });

    store.close();

    expect(useModalStore.getState().isOpen).toBe(false);

    store.open('create-role');

    expect(useModalStore.getState().modal).toBe('create-role');
    expect(useModalStore.getState().isOpen).toBe(true);
  });
});
