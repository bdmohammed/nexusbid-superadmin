import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";

export default function UserStats() {
  const cards = [
    {
      title: "Total Users",
      value: "14,284",
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Active Users",
      value: "13,112",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Administrators",
      value: "12",
      icon: ShieldCheck,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Suspended",
      value: "43",
      icon: UserX,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon size={24} />
              </div>
            </div>

            <p className="mt-6 text-sm text-text-light">{card.title}</p>

            <h3 className="mt-2 text-3xl font-bold text-text">{card.value}</h3>
          </div>
        );
      })}
    </div>
  );
}
