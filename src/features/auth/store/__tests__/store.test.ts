import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../store';

import type { User } from '@/types';
import { AccountType, UserStatus } from '@/types';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@test.com',
  accountType: AccountType.ADMIN,
  companyName: null,
  country: 'USA',
  emailVerified: true,
  isBlocked: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  adminRole: 'super_admin',
  status: UserStatus.ACTIVE,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
    });
  });

  it('has the correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(true);
  });

  it('sets authentication status', () => {
    useAuthStore.getState().setAuthenticated(true);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setAuthenticated(false);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('initializes with a user', () => {
    useAuthStore.getState().initialize(mockUser);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitializing).toBe(false);
  });

  it('initializes without a user', () => {
    useAuthStore.getState().initialize(null);

    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });

  it('sets user', () => {
    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);

    // setUser should not change initialization state
    expect(state.isInitializing).toBe(true);
  });

  it('logs out', () => {
    useAuthStore.getState().initialize(mockUser);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
  });

  it('supports multiple state transitions', () => {
    const store = useAuthStore.getState();

    store.initialize(mockUser);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    store.setAuthenticated(false);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    store.setAuthenticated(true);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    store.logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it('replaces the current user when setUser is called again', () => {
    const secondUser: User = {
      ...mockUser,
      id: '2',
      name: 'Jane Doe',
      email: 'jane@test.com',
    };

    const store = useAuthStore.getState();

    store.setUser(mockUser);
    store.setUser(secondUser);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(secondUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('can recover after logout', () => {
    const store = useAuthStore.getState();

    store.initialize(mockUser);
    store.logout();
    store.initialize(mockUser);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitializing).toBe(false);
  });
});
