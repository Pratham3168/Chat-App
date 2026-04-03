import {
  MessageCircle,
  Users,
  Inbox,
  Settings,
  LogOut,
  Search,
} from "lucide-react";

import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";

const menu = [
  { id: "chats", icon: MessageCircle },
  { id: "contacts", icon: Users },
  { id: "search", icon: Search },
  { id: "requests", icon: Inbox },
  { id: "settings", icon: Settings },
];

function Sidebar() {

    const { activeTab, setActiveTab } = useChatStore();
    const { logout, authUser, updateProfile } = useAuthStore();
    
    

  return (
    <div className="h-screen w-16 bg-[#0f172a] flex flex-col justify-between border-r border-[#1e293b]">

      {/* TOP MENU */}
      <div className="flex flex-col items-center gap-4 mt-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl transition
              ${
                active
                  ? "bg-[#1d4ed8] text-white"
                  : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
              }`}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col items-center gap-4 mb-4">
        
        {/* Settings */}
        <button
          onClick={() => setActiveTab("profile")}
          className="p-3 rounded-xl text-gray-400 hover:bg-[#1e293b] hover:text-white transition"
        >
          <Settings size={22} />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;