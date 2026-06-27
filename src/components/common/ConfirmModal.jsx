"use client";

import { AlertTriangle } from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Delete",
  message = "Are you sure?",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-md"
      title=""
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>

          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={30} className="text-red-600" />
        </div>

        <h2 className="text-xl font-semibold text-text">{title}</h2>

        <p className="mt-3 text-sm leading-6 text-text-light">{message}</p>
      </div>
    </Modal>
  );
}
