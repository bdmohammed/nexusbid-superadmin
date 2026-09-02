import { beforeEach, describe, expect, it } from 'vitest';

import { useSidebarStore } from '../sidebar.store';

describe('useSidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.getState().reset();
  });

  it('has the initial state', () => {
    const state = useSidebarStore.getState();

    expect(state.isOpen).toBe(true);
    expect(state.isCollapsed).toBe(false);
  });

  it('opens the sidebar', () => {
    const store = useSidebarStore.getState();

    store.close();
    store.open();

    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('closes the sidebar', () => {
    useSidebarStore.getState().close();

    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('toggles sidebar visibility', () => {
    const store = useSidebarStore.getState();

    store.toggle();
    expect(useSidebarStore.getState().isOpen).toBe(false);

    store.toggle();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('collapses the sidebar', () => {
    useSidebarStore.getState().collapse();

    expect(useSidebarStore.getState().isCollapsed).toBe(true);
  });

  it('expands the sidebar', () => {
    const store = useSidebarStore.getState();

    store.collapse();
    store.expand();

    expect(useSidebarStore.getState().isCollapsed).toBe(false);
  });

  it('toggles collapsed state', () => {
    const store = useSidebarStore.getState();

    store.toggleCollapse();
    expect(useSidebarStore.getState().isCollapsed).toBe(true);

    store.toggleCollapse();
    expect(useSidebarStore.getState().isCollapsed).toBe(false);
  });

  it('sets collapsed state', () => {
    const store = useSidebarStore.getState();

    store.setCollapsed(true);
    expect(useSidebarStore.getState().isCollapsed).toBe(true);

    store.setCollapsed(false);
    expect(useSidebarStore.getState().isCollapsed).toBe(false);
  });

  it('sets open state', () => {
    const store = useSidebarStore.getState();

    store.setOpen(false);
    expect(useSidebarStore.getState().isOpen).toBe(false);

    store.setOpen(true);
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('resets the store', () => {
    const store = useSidebarStore.getState();

    store.close();
    store.collapse();

    expect(useSidebarStore.getState().isOpen).toBe(false);
    expect(useSidebarStore.getState().isCollapsed).toBe(true);

    store.reset();

    expect(useSidebarStore.getState().isOpen).toBe(true);
    expect(useSidebarStore.getState().isCollapsed).toBe(false);
  });

  it('supports multiple state transitions', () => {
    const store = useSidebarStore.getState();

    store.close();
    store.collapse();

    expect(useSidebarStore.getState()).toMatchObject({
      isOpen: false,
      isCollapsed: true,
    });

    store.open();
    store.expand();

    expect(useSidebarStore.getState()).toMatchObject({
      isOpen: true,
      isCollapsed: false,
    });

    store.toggle();
    store.toggleCollapse();

    expect(useSidebarStore.getState()).toMatchObject({
      isOpen: false,
      isCollapsed: true,
    });
  });
});
