"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/common/Select";
import PermissionPreset from "./PermissionPreset";
import PermissionMatrix from "./PermissionMatrix";

const initialForm = {
  roleName: "",
  description: "",
  department: "",
  assignedUser: "",
  preset: "",
  status: "Active",
  notes: "",
};

export default function RoleCreateDrawer({
  open,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialForm);

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSelectedPermissions([]);
    }
  }, [open]);

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      ...form,
      permissions: selectedPermissions,
    });

    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col bg-surface shadow-2xl">

        {/* Header */}

        <div className="flex items-start justify-between border-b border-border p-6">

          <div>

            <h2 className="text-2xl font-bold">
              Create New Role
            </h2>

            <p className="mt-2 text-sm text-text-light">
              Define permissions and create a new
              administrator role.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-background"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-8 overflow-y-auto p-6"
        >
          {/* Role Details */}

          <section className="space-y-5">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Role Details
            </h3>

            <Input
              label="Role Name"
              name="roleName"
              value={form.roleName}
              onChange={handleChange}
              placeholder="Compliance Officer"
            />

            <div>

              <label className="mb-2 block text-sm font-medium">
                Role Description
              </label>

              <textarea
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Describe the responsibilities of this role..."
              />

            </div>

          </section>

          {/* Assignment */}

          <section className="grid gap-5 md:grid-cols-2">

            <Input
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Compliance"
            />

            <Input
              label="Assigned User"
              name="assignedUser"
              value={form.assignedUser}
              onChange={handleChange}
              placeholder="Search User..."
            />

          </section>

          {/* Status */}

          <section>

            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
            </Select>

          </section>

          {/* Permission Preset */}

          <PermissionPreset
            value={form.preset}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                preset: e.target.value,
              }))
            }
          />

          {/* Permission Matrix */}

          <PermissionMatrix
            selectedPermissions={
              selectedPermissions
            }
            setSelectedPermissions={
              setSelectedPermissions
            }
          />

          {/* Notes */}

          <section>

            <label className="mb-2 block text-sm font-medium">
              Notes
            </label>

            <textarea
              rows={4}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Internal notes..."
            />

          </section>

        </form>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t border-border p-6">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            Create Role
          </Button>

        </div>

      </div>
    </>
  );
}