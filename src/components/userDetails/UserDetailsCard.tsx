import type { UserDetails } from "@/types";
import UserAccountInfo from "./UserAccountInfo";
import UserActivity from "./UserActivity";
import UserInformation from "./UserInformation";
import UserPurchaseTable from "./UserPurchaseTable";
import UserStatistics from "./UserStatistics";
import UserSubscription from "./UserSubscription";
import UserSummary from "./UserSummary";

export interface UserDetailsCardProps {
  user: UserDetails;
}

export default function UserDetailsCard({ user }: UserDetailsCardProps) {
  return (
    <div className="space-y-6">
      <UserSummary user={user} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UserInformation user={user} />
          <UserStatistics user={user} />
          <UserPurchaseTable />
        </div>

        <div className="space-y-6">
          <UserSubscription user={user} />
          <UserAccountInfo user={user} />
          <UserActivity user={user} />
        </div>
      </div>
    </div>
  );
}
