import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import UserLoadingSkeleton from "./UserLoadingSkeleton.jsx";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../stores/useAuthStore.js";
// import { useAuthStore } from "../stores/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, unreadByUser, selectedUser } = useChatStore();
  const chatsList = Array.isArray(chats) ? chats : [];
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UserLoadingSkeleton />;
  if (chatsList.length === 0) return <NoChatsFound />;

  return (
    <>
      {chatsList.map((chat) => {
        const unreadCount = unreadByUser?.[chat._id] || 0;
        const isSelected = selectedUser?._id === chat._id;

        return (
          <div
            key={chat._id}
            className={`p-4 rounded-lg cursor-pointer transition-colors border ${
              unreadCount > 0
                ? "bg-cyan-500/20 border-cyan-400/40 hover:bg-cyan-500/25"
                : isSelected
                ? "bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/20"
                : "bg-cyan-500/10 border-transparent hover:bg-cyan-500/20"
            }`}
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`avatar ${onlineUsers.includes(chat._id) ? "avatar-online" : "avatar-offline"}`}>
                  <div className="w-12 rounded-full">
                    <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                  </div>
                </div>
                <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
              </div>

              {unreadCount > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-xs font-semibold text-slate-900">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;