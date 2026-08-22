import { create } from "zustand";

export type ModalType =
  | "create-user"
  | "edit-user"
  | "delete-user"
  | "create-role"
  | "edit-role"
  | "delete-role"
  | "assign-role"
  | "confirm"
  | "custom";

interface ModalPayloadMap {
  "create-user": undefined;
  "edit-user": { id: string };
  "delete-user": { id: string };
  "create-role": undefined;
  "edit-role": { id: string };
  "delete-role": { id: string };
  "assign-role": { userId: string };
  confirm: {
    title: string;
    description: string;
    onConfirm: () => void;
  };
  custom: unknown;
}

interface ModalStore {
  /**
   * Currently active modal.
   */
  modal: ModalType | null;

  /**
   * Whether a modal is open.
   */
  isOpen: boolean;

  /**
   * Data passed to the modal.
   */
  data: ModalPayloadMap[ModalType] | null;

  /**
   * Open a modal.
   */
  open: <TModal extends ModalType>(
    modal: TModal,
    data?: ModalPayloadMap[TModal],
  ) => void;

  /**
   * Close the modal.
   */
  close: () => void;

  /**
   * Update modal data.
   */
  setData: (data: ModalPayloadMap[ModalType] | null) => void;

  /**
   * Reset state.
   */
  reset: () => void;
}

const initialState = {
  modal: null,
  isOpen: false,
  data: null,
};

export const useModalStore = create<ModalStore>((set) => ({
  ...initialState,

  open: (modal, data) =>
    set({
      modal,
      data,
      isOpen: true,
    }),

  close: () =>
    set({
      ...initialState,
    }),

  setData: (data) =>
    set({
      data,
    }),

  reset: () => set(initialState),
}));
