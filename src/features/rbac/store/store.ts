import { create } from "zustand";

export type SortDirection = "asc" | "desc";

interface RbacStore {
  // ---------------------------------------------------------------------------
  // Selected entities
  // ---------------------------------------------------------------------------

  selectedRoleId: string | null;
  selectedModuleId: string | null;

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  drawerOpen: boolean;

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  search: string;

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  activeOnly: boolean;

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  sortBy: string;
  sortDirection: SortDirection;

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  page: number;
  pageSize: number;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  setSelectedRole: (id: string | null) => void;
  setSelectedModule: (id: string | null) => void;

  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  setSearch: (value: string) => void;

  setActiveOnly: (value: boolean) => void;

  setSort: (sortBy: string, direction: SortDirection) => void;

  setPage: (page: number) => void;

  setPageSize: (size: number) => void;

  reset: () => void;
}

const initialState = {
  selectedRoleId: null,
  selectedModuleId: null,

  drawerOpen: false,

  search: "",

  activeOnly: true,

  sortBy: "name",
  sortDirection: "asc" as const,

  page: 1,
  pageSize: 10,
};

export const useRbacStore = create<RbacStore>((set) => ({
  ...initialState,

  setSelectedRole: (id) =>
    set({
      selectedRoleId: id,
    }),

  setSelectedModule: (id) =>
    set({
      selectedModuleId: id,
    }),

  openDrawer: () =>
    set({
      drawerOpen: true,
    }),

  closeDrawer: () =>
    set({
      drawerOpen: false,
    }),

  toggleDrawer: () =>
    set((state) => ({
      drawerOpen: !state.drawerOpen,
    })),

  setSearch: (search) =>
    set({
      search,
      page: 1,
    }),

  setActiveOnly: (activeOnly) =>
    set({
      activeOnly,
      page: 1,
    }),

  setSort: (sortBy, sortDirection) =>
    set({
      sortBy,
      sortDirection,
    }),

  setPage: (page) =>
    set({
      page,
    }),

  setPageSize: (pageSize) =>
    set({
      pageSize,
      page: 1,
    }),

  reset: () => set(initialState),
}));
