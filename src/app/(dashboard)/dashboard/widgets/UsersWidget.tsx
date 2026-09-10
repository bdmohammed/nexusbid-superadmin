'use client';

import { CheckCircle, Shield, ShieldAlert, Users } from 'lucide-react';

import { useDashboardStore } from '@/store/useDashboardStore';

export default function UsersWidget() {
  const users = useDashboardStore((state) => state.snapshot?.user);

  if (!users) {
    return (
      <div className="flex h-full items-center justify-center animate-pulse text-sm italic text-text-light">
        Compiling active users...
      </div>
    );
  }

  const items = [
    {
      label: 'Customers',
      value: users.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Admins',
      value: users.admins,
      icon: Shield,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Pending Approvals',
      value: users.pendingApprovals,
      icon: CheckCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Blocked Users',
      value: users.blockedUsers,
      icon: ShieldAlert,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-text-light">
          <Users className="h-4.5 w-4.5 text-primary" />
          User Access Management
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-background p-3"
            >
              <span className={`rounded-lg p-2 ${item.bg}`}>
                <Icon className={`h-4.5 w-4.5 ${item.color}`} />
              </span>

              <div>
                <span className="block text-[10px] font-bold text-text-light">{item.label}</span>

                <span className="text-lg font-black text-text">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
