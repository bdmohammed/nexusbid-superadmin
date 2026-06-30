import {
  CheckCircle2,
} from "lucide-react";

export default function UserActivity({ user }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">

      <div className="border-b border-border px-6 py-4">

        <h3 className="text-lg font-semibold">
          Recent Activity
        </h3>

      </div>

      <div className="space-y-4 p-6">

        {user.recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex gap-3"
          >
            <CheckCircle2
              size={18}
              className="mt-1 text-primary"
            />

            <div>

              <p className="text-sm font-medium">
                {activity}
              </p>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}