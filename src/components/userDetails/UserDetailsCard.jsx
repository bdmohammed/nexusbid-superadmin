// import UserInformation from "./UserInformation";
// import UserSubscription from "./UserSubscription";
// import UserStatistics from "./UserStatistics";
// import UserActivity from "./UserActivity";

// export default function UserDetailsCard({ user }) {

//   return (

//     <div className="grid gap-6 lg:grid-cols-3">

//       <div className="space-y-6 lg:col-span-2">

//         <UserInformation user={user}/>

//         <UserStatistics user={user}/>

//       </div>

//       <div className="space-y-6">

//         <UserSubscription user={user}/>

//         <UserActivity user={user}/>

//       </div>

//     </div>

//   );

// }

import UserInformation from "./UserInformation";
import UserSubscription from "./UserSubscription";
import UserStatistics from "./UserStatistics";
import UserActivity from "./UserActivity";
import UserSummary from "./UserSummary";
import UserPurchaseTable from "./UserPurchaseTable";
import UserAccountInfo from "./UserAccountInfo";

export default function UserDetailsCard({ user }) {
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