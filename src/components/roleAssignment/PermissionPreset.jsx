"use client";

import permissionPresets from "@/data/permissionPresets";
import Select from "@/components/common/Select";

export default function PermissionPreset({
  value,
  onChange,
}) {
  const selectedPreset = permissionPresets.find(
    (preset) => preset.name === value
  );

  return (
    <div className="space-y-3">

      <div>
        <label className="mb-2 block text-sm font-medium text-text">
          Permission Preset
        </label>

        <Select
          value={value}
          onChange={onChange}
        >
          <option value="">
            Select Permission Preset
          </option>

          {permissionPresets.map((preset) => (
            <option
              key={preset.id}
              value={preset.name}
            >
              {preset.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedPreset && (
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">

          <p className="text-sm font-semibold text-primary">
            {selectedPreset.name}
          </p>

          <p className="mt-1 text-sm text-text-light">
            {selectedPreset.description}
          </p>

        </div>
      )}

    </div>
  );
}