import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";
import ChatHeader from "./ChatHeader"; 
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton"; 

// Message Status Indicator Component
const MessageStatusIcon = ({ status }) => {
  if (!status) return null;

  if (status === "sent") {
    return (
      <svg
        className="w-4 h-4 inline-block ml-1"
        fill="currentColor"
        viewBox="0 0 20 20"
        title="Sent"
      >
        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
      </svg>
    );
  }

  if (status === "delivered") {
    return (
      <svg
        className="w-4 h-4 inline-block ml-1"
        fill="currentColor"
        viewBox="0 0 20 20"
        title="Delivered"
      >
        <g>
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" transform="translate(-2, 0)" />
        </g>
      </svg>
    );
  }

  if (status === "read") {
    return (
      <svg
        className="w-4 h-4 inline-block ml-1 text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        title="Read"
      >
        <g>
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" transform="translate(-2, 0)" />
        </g>
      </svg>
    );
  }

  return null;
};

function ChatContainer() {
  // const {
  //   selectedUser,
  //   getMessagesByUserId,
  //   messages,
  //   isMessagesLoading,
  // } = useChatStore();
  const {
  selectedUser,
  getMessagesByUserId,
  loadOlderMessages,
  messages,
  isMessagesLoading,
  hasMoreMessages,
  isLoadingMoreMessages,
} = useChatStore();
  const { authUser } = useAuthStore();

  // const messageEndRef = useRef(null);
const messagesListRef = useRef(null);

  const messageEndRef = useRef(null);

  // Fetch initial messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id,{reset:true});
    }
  }, [selectedUser?._id, getMessagesByUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current && !isMessagesLoading) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);

  const handleShowOlder = async () => {
  const listEl = messagesListRef.current;
  if (!listEl) return;

  const prevScrollHeight = listEl.scrollHeight;
  const prevScrollTop = listEl.scrollTop;

  await loadOlderMessages();

  requestAnimationFrame(() => {
    const newScrollHeight = listEl.scrollHeight;
    listEl.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
  });
};

  return (
    <>
      <ChatHeader />
      <div ref={messagesListRef} className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-7xl mx-auto space-y-6">
            {hasMoreMessages && (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={handleShowOlder}
      disabled={isLoadingMoreMessages}
      className="px-4 py-2 rounded-full bg-slate-700 text-slate-100 text-xs hover:bg-slate-600 disabled:opacity-60 mb-2"
    >
      {isLoadingMoreMessages ? "Loading..." : "Show older messages"}
    </button>
  </div>
)}
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${String(msg.senderId) === String(authUser._id) ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble max-w-2xl rounded-5xl relative ${
                    String(msg.senderId) === String(authUser._id)
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <div className="text-xs mt-1 opacity-75 flex items-center justify-between">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {String(msg.senderId) === String(authUser._id) && (
                      <MessageStatusIcon status={msg.status} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        )  : isMessagesLoading ? <MessagesLoadingSkeleton/> : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
      
    </>
  );
}

export default ChatContainer;