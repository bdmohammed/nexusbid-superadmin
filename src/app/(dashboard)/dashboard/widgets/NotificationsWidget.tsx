'use client';

import { Bell, Info } from 'lucide-react';

export default function NotificationsWidget() {
  const notifications = [
    { text: "Security Role 'Auditor' requires approval", type: 'ROLE' },
    { text: 'Tender ID #1105 closing deadline is tomorrow', type: 'TENDER' },
    {
      text: "Tenant subscription 'Standard' expires in 3 days",
      type: 'SUBSCRIPTION',
    },
    {
      text: 'Payment transaction failure reported for Tenant #88',
      type: 'PAYMENT',
    },
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5">
          <Bell className="h-4.5 w-4.5 text-primary" />
          System Notifications
        </h3>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border/50 text-xs"
          >
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[9px] text-primary block uppercase tracking-wider mb-0.5">
                {notif.type}
              </span>
              <p className="text-text leading-normal">{notif.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
