import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotificationStore } from '../notification.store';

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.getState().clear();

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(),
    });
  });

  it('has initial state', () => {
    expect(useNotificationStore.getState().notifications).toEqual([]);
  });

  it('adds a notification with default duration', () => {
    vi.mocked(crypto.randomUUID).mockReturnValue('id-1');

    useNotificationStore.getState().add({
      title: 'Success',
      type: 'success',
    });

    expect(useNotificationStore.getState().notifications).toEqual([
      {
        id: 'id-1',
        title: 'Success',
        type: 'success',
        duration: 5000,
      },
    ]);
  });

  it('adds a notification with custom duration', () => {
    vi.mocked(crypto.randomUUID).mockReturnValue('id-2');

    useNotificationStore.getState().add({
      title: 'Saved',
      description: 'Profile updated',
      type: 'info',
      duration: 3000,
    });

    expect(useNotificationStore.getState().notifications[0]).toEqual({
      id: 'id-2',
      title: 'Saved',
      description: 'Profile updated',
      type: 'info',
      duration: 3000,
    });
  });

  it('generates an id using crypto.randomUUID', () => {
    vi.mocked(crypto.randomUUID).mockReturnValue('uuid-123');

    useNotificationStore.getState().add({
      title: 'Test',
      type: 'warning',
    });

    expect(crypto.randomUUID).toHaveBeenCalledOnce();
    expect(useNotificationStore.getState().notifications[0]?.id).toBe('uuid-123');
  });

  it('removes a notification', () => {
    vi.mocked(crypto.randomUUID).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

    const { add, remove } = useNotificationStore.getState();

    add({
      title: 'First',
      type: 'success',
    });

    add({
      title: 'Second',
      type: 'error',
    });

    remove('id-1');

    expect(useNotificationStore.getState().notifications).toEqual([
      expect.objectContaining({
        id: 'id-2',
        title: 'Second',
      }),
    ]);
  });

  it('does nothing when removing unknown id', () => {
    vi.mocked(crypto.randomUUID).mockReturnValue('id-1');

    const { add, remove } = useNotificationStore.getState();

    add({
      title: 'Test',
      type: 'success',
    });

    remove('unknown');

    expect(useNotificationStore.getState().notifications).toHaveLength(1);
  });

  it('clears notifications', () => {
    vi.mocked(crypto.randomUUID).mockReturnValue('id-1');

    const { add, clear } = useNotificationStore.getState();

    add({
      title: 'Test',
      type: 'success',
    });

    clear();

    expect(useNotificationStore.getState().notifications).toEqual([]);
  });

  it('supports multiple notifications', () => {
    vi.mocked(crypto.randomUUID)
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('2')
      .mockReturnValueOnce('3');

    const { add } = useNotificationStore.getState();

    add({
      title: 'One',
      type: 'success',
    });

    add({
      title: 'Two',
      type: 'warning',
    });

    add({
      title: 'Three',
      type: 'error',
    });

    expect(useNotificationStore.getState().notifications).toHaveLength(3);
  });

  it('supports every notification type', () => {
    vi.mocked(crypto.randomUUID)
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('2')
      .mockReturnValueOnce('3')
      .mockReturnValueOnce('4');

    const { add } = useNotificationStore.getState();

    add({ title: 'S', type: 'success' });
    add({ title: 'E', type: 'error' });
    add({ title: 'W', type: 'warning' });
    add({ title: 'I', type: 'info' });

    expect(useNotificationStore.getState().notifications.map((n) => n.type)).toEqual([
      'success',
      'error',
      'warning',
      'info',
    ]);
  });
});
