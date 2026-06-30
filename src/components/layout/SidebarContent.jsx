// "use client";

// import { LogOut } from "lucide-react";
// import navigation from "@/constants/navigation";
// import Logo from "../common/Logo";
// import Avatar from "../common/Avatar";
// import SidebarItem from "./SidebarItem";

// export default function SidebarContent({ onNavigate }) {
//   return (
//     <div className="flex h-full flex-col">
//       <div className="flex h-14 shrink-0 items-center px-4 py-1 sm:h-16 sm:px-5">
//         <Logo />
//       </div>

//       <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5">
//         <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
//           Menu
//         </p>
//         <nav className="space-y-2">
//           {navigation.map((item) => (
//             <SidebarItem key={item.href} item={item} onClick={onNavigate} />
//           ))}
//         </nav>
//          <p className="mt-3 mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
//           System
//         </p>
//         <nav className="space-y-2">
//           {systemNavigation.map((item) => (
//             <SidebarItem key={item.href} item={item} onClick={onNavigate} />
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// }

"use client";

import Logo from "../common/Logo";
import SidebarItem from "./SidebarItem";
import { navigation, systemNavigation } from "@/constants/navigation";

export default function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-4 py-1 sm:h-16 sm:px-5">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5">
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
          Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              onClick={onNavigate}
            />
          ))}
        </nav>

        <p className="mt-6 mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-light">
          System
        </p>

        <nav className="space-y-2">
          {systemNavigation.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              onClick={onNavigate}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}