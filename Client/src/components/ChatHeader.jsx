import React, { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import { XIcon } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, isSelectedUserTyping } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
    border-slate-700/50 max-h-21 px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div
          className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"}`}
        >
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">
            {selectedUser.fullName}
          </h3>
          {isSelectedUserTyping ? (
            <div className="flex items-center gap-1 text-cyan-400 text-sm h-5">
              <span>Typing</span>
              <span className="inline-flex items-center gap-0.5" aria-label="typing-indicator">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
          )}
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader;
