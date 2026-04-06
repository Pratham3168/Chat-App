// import {
//   MessageCircle,
//   Users,
//   Inbox,
//   LogOut,
//   Search,
//   User,
// } from "lucide-react";

// import { useChatStore } from "../stores/useChatStore";
// import { useAuthStore } from "../stores/useAuthStore";
// import { useFriendStore } from "../stores/useFriendStore";

// const menu = [
//   { id: "chats", icon: MessageCircle },
//   { id: "friends", icon: Users },
//   { id: "search", icon: Search },
//   { id: "requests", icon: Inbox },
// ];

// function Sidebar() {

//     const { activeTab, setActiveTab } = useChatStore();
//     const { logout } = useAuthStore();
//   const incomingCount = useFriendStore((state) => state.incomingRequests?.length || 0);
    
    

//   return (
//     <div className="h-screen w-16 bg-[#0f172a] flex flex-col justify-between border-r border-[#1e293b]">

//       {/* TOP MENU */}
//       <div className="flex flex-col items-center gap-4 mt-4">
//         {menu.map((item) => {
//           const Icon = item.icon;
//           const active = activeTab === item.id;

//           return (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id)}
//               className={`p-3 rounded-xl transition
//               ${
//                 active
//                   ? "bg-[#1d4ed8] text-white"
//                   : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
//               }`}
//             >
//               <span className="relative inline-flex">
//               <Icon size={22} />
//               {item.id === "requests" && incomingCount > 0 && (
//                 <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
//                   {incomingCount > 99 ? "99+" : incomingCount}
//                 </span>
//               )}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* BOTTOM */}
//       <div className="flex flex-col items-center gap-4 mb-4">
        
//         {/* Settings */}
//         <button
//           onClick={() => setActiveTab("profile")}
//           className="p-3 rounded-xl text-gray-400 hover:bg-[#1e293b] hover:text-white transition"
//         >
//           <User size={22} />
//         </button>

//         {/* Logout */}
//         <button
//           onClick={logout}
//           className="p-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
//         >
//           <LogOut size={22} />
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Sidebar;



import {
  MessageCircle,
  Users,
  Inbox,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";

import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFriendStore } from "../stores/useFriendStore";
import ConfirmDialog from "./ConfirmDialog";

const menu = [
  { id: "chats", icon: MessageCircle },
  { id: "friends", icon: Users },
  { id: "search", icon: Search },
  { id: "requests", icon: Inbox },
];

function Sidebar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { activeTab, setActiveTab } = useChatStore();
  const { logout } = useAuthStore();
  const incomingCount = useFriendStore(
    (state) => state.incomingRequests?.length || 0
  );

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <div
      className="
      fixed bottom-0 left-0 right-0 z-50
      h-16 bg-[#0f172a] border-t border-[#1e293b]
      flex items-center justify-between px-4
      
      lg:static lg:h-screen lg:w-16 lg:flex-col lg:justify-between 
      lg:border-t-0 lg:border-r
    "
    >
      {/* TOP MENU */}
      <div className="flex items-center justify-between w-full lg:flex-col lg:gap-4 lg:mt-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center justify-center
                p-2 lg:p-3 rounded-xl transition
                ${
                  active
                    ? "bg-[#1d4ed8] text-white scale-105"
                    : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
                }
              `}
            >
              <span className="relative inline-flex">
                <Icon size={22} />
                {item.id === "requests" && incomingCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {incomingCount > 99 ? "99+" : incomingCount}
                  </span>
                )}
              </span>

              {/* LABEL (mobile only) */}
              <span className="text-[10px] mt-1 lg:hidden capitalize">
                {item.id}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab("profile")}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 transition hover:bg-[#1e293b] hover:text-white lg:hidden"
        >
          <User size={22} />
          <span className="text-[10px] mt-1 capitalize">Profile</span>
        </button>
      </div>

      {/* BOTTOM (desktop only) */}
      <div className="hidden lg:flex flex-col items-center gap-4 mb-4">
        <button
          onClick={() => setActiveTab("profile")}
          className="p-3 rounded-xl text-gray-400 hover:bg-[#1e293b] hover:text-white transition"
        >
          <User size={22} />
        </button>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="p-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={22} />
        </button>
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        title="Logout"
        message="Do you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
}

export default Sidebar;