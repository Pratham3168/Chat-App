import React, { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import { ArrowLeftIcon } from "lucide-react";
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
      className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50 px-4 py-3 shrink-0 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-700/60 hover:text-white lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

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

        <div className="min-w-0">
          <h3 className="truncate font-medium text-slate-200">
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
    </div>
  );
}

export default ChatHeader;
