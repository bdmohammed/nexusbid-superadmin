import { Building2, Mail, MapPin, Phone } from "lucide-react";
import type { UserDetails } from "@/types";

export interface UserSummaryProps {
  user: UserDetails;
}

export default function UserSummary({ user }: UserSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold">Profile Summary</h3>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-primary" />
          <div>
            <p className="text-xs text-text-light">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone size={18} className="text-primary" />
          <div>
            <p className="text-xs text-text-light">Phone</p>
            <p className="font-medium">{user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Building2 size={18} className="text-primary" />
          <div>
            <p className="text-xs text-text-light">Company</p>
            <p className="font-medium">{user.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin size={18} className="text-primary" />
          <div>
            <p className="text-xs text-text-light">Location</p>
            <p className="font-medium">
              {user.city}, {user.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
