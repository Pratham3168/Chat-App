import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const MessageStatusIcon = ({ status }) => {
  if (!status) return null;

  if (status === "sent") {
    return (
      <svg
        className="inline-block h-4 w-4 ml-1"
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
        className="inline-block h-4 w-4 ml-1"
        fill="currentColor"
        viewBox="0 0 20 20"
        title="Delivered"
      >
        <g>
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          <path
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            transform="translate(-2, 0)"
          />
        </g>
      </svg>
    );
  }

  if (status === "read") {
    return (
      <svg
        className="inline-block h-4 w-4 ml-1 text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        title="Read"
      >
        <g>
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          <path
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            transform="translate(-2, 0)"
          />
        </g>
      </svg>
    );
  }

  return null;
};

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    loadOlderMessages,
    retryMessage,
    retryFailedMessagesForSelectedUser,
    messages,
    isMessagesLoading,
    hasMoreMessages,
    isLoadingMoreMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messagesListRef = useRef(null);
  const messageEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id, { reset: true });
    }
  }, [selectedUser?._id, getMessagesByUserId]);

  useEffect(() => {
    const latestMessageId = messages[messages.length - 1]?._id ?? null;

    if (
      messageEndRef.current &&
      !isMessagesLoading &&
      latestMessageId !== lastMessageIdRef.current
    ) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    lastMessageIdRef.current = latestMessageId;
  }, [messages, isMessagesLoading]);

  useEffect(() => {
    const handleBackOnline = () => {
      retryFailedMessagesForSelectedUser();
    };

    window.addEventListener("online", handleBackOnline);
    return () => window.removeEventListener("online", handleBackOnline);
  }, [retryFailedMessagesForSelectedUser]);

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ChatHeader />

      <div ref={messagesListRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            {hasMoreMessages && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleShowOlder}
                  disabled={isLoadingMoreMessages}
                  className="mb-2 rounded-full bg-slate-700 px-4 py-2 text-xs text-slate-100 transition-colors hover:bg-slate-600 disabled:opacity-60"
                >
                  {isLoadingMoreMessages ? "Loading..." : "Show older messages"}
                </button>
              </div>
            )}

            {messages.map((msg) => {
              const isOutgoing = String(msg.senderId) === String(authUser._id);

              return (
                <div key={msg._id} className="flex w-full">
                  <div
                    className={`max-w-[70%] wrap-break-word rounded-2xl px-4 py-3 shadow-sm ${
                      isOutgoing
                        ? "ml-auto bg-cyan-600 text-white"
                        : "mr-auto bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="mb-2 max-h-72 w-full rounded-lg object-cover"
                      />
                    )}

                    {msg.text && (
                      <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs opacity-75">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOutgoing && (
                        msg.status === "failed" ? (
                          <button
                            type="button"
                            onClick={() => retryMessage(msg._id)}
                            className="rounded-full border border-rose-300/60 px-2 py-0.5 text-[10px] font-medium text-rose-100 transition-colors hover:bg-rose-500/25"
                          >
                            Failed • Retry
                          </button>
                        ) : msg.status === "sending" ? (
                          <span className="text-[10px]">Sending...</span>
                        ) : (
                          <MessageStatusIcon status={msg.status} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

  
export default ChatContainer;