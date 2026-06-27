"use client";

import { useState } from "react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CategoryModal({
  open,
  onClose,
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      open={open}
      title="Create Category"
      width="max-w-2xl"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button>

            Save Category

          </Button>
        </>
      }
    >
      <div className="grid gap-5">

        <Input
          label="Category Name"
          name="name"
          placeholder="Civil Works"
          value={form.name}
          onChange={handleChange}
        />

        <Input
          label="Slug"
          name="slug"
          placeholder="civil-works"
          value={form.slug}
          onChange={handleChange}
        />

        <div>

          <label className="mb-2 block text-sm font-medium">

            Description

          </label>

          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter category description..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">

            Status

          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="h-11 w-full rounded-xl border border-border bg-surface px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option>Active</option>
            <option>Draft</option>
            <option>Inactive</option>
          </select>

        </div>

      </div>
    </Modal>
  );
}