export default function UserSubscription({ user }) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">

      <div className="border-b border-border px-6 py-4">

        <h3 className="text-lg font-semibold">
          Subscription
        </h3>

      </div>

      <div className="space-y-5 p-6">

        <div>

          <p className="text-sm text-text-light">
            Current Plan
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {user.subscription}
          </h2>

        </div>

        <div>

          <p className="text-sm text-text-light">
            Plan Price
          </p>

          <h4 className="mt-1 font-medium">
            {user.planPrice}
          </h4>

        </div>

        <div>

          <p className="text-sm text-text-light">
            Status
          </p>

          <p className="mt-1 font-medium text-green-600">
            Active
          </p>

        </div>

      </div>
    </div>
  );
}