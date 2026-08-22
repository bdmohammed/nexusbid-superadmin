import { create } from "zustand";

interface SidebarStore {
  /**
   * Whether the sidebar is currently open.
   */
  isOpen: boolean;

  /**
   * Whether the sidebar is collapsed.
   */
  isCollapsed: boolean;

  /**
   * Open the sidebar.
   */
  open: () => void;

  /**
   * Close the sidebar.
   */
  close: () => void;

  /**
   * Toggle sidebar visibility.
   */
  toggle: () => void;

  /**
   * Collapse the sidebar.
   */
  collapse: () => void;

  /**
   * Expand the sidebar.
   */
  expand: () => void;

  /**
   * Toggle collapsed state.
   */
  toggleCollapse: () => void;

  /**
   * Set collapsed state.
   */
  setCollapsed: (collapsed: boolean) => void;

  /**
   * Set open state.
   */
  setOpen: (open: boolean) => void;

  /**
   * Reset sidebar to defaults.
   */
  reset: () => void;
}

const initialState = {
  isOpen: true,
  isCollapsed: false,
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  ...initialState,

  open: () =>
    set({
      isOpen: true,
    }),

  close: () =>
    set({
      isOpen: false,
    }),

  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),

  collapse: () =>
    set({
      isCollapsed: true,
    }),

  expand: () =>
    set({
      isCollapsed: false,
    }),

  toggleCollapse: () =>
    set((state) => ({
      isCollapsed: !state.isCollapsed,
    })),

  setCollapsed: (collapsed) =>
    set({
      isCollapsed: collapsed,
    }),

  setOpen: (open) =>
    set({
      isOpen: open,
    }),

  reset: () => set(initialState),
}));
