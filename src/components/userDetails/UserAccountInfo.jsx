export default function UserAccountInfo({ user }) {
  const items = [
    {
      label: "Role",
      value: user.role,
    },
    {
      label: "Status",
      value: user.status,
    },
    {
      label: "Joined",
      value: user.joined,
    },
    {
      label: "Last Login",
      value: user.lastLogin,
    },
    {
      label: "Login Count",
      value: user.loginCount,
    },
    {
      label: "Purchases",
      value: user.totalPurchases,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">

      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold">
          Account Summary
        </h3>
      </div>

      <div className="space-y-4 p-6">

        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-border pb-3 last:border-none last:pb-0"
          >
            <span className="text-sm text-text-light">
              {item.label}
            </span>

            <span className="font-medium">
              {item.value}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}