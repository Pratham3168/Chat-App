import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // Privacy-first mode: keep contact flow disabled for now
  // allContacts : [],
  chats: [],
  messages: [],
  unreadByUser: {},
  activeTab: "chats",
  isUsersLoading: false,
  selectedUser: null,
  isSelectedUserTyping: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  messageCursor: null,
hasMoreMessages: true,
isLoadingMoreMessages: false,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setSelectedUser: (selectedUser) =>
    set((state) => {
      if (!selectedUser?._id) {
        return { selectedUser };
      }

      // SECURITY: Verify selected user is in chat list (i.e., is a friend)
      const isFriend = (state.chats || []).some(
        (chat) => String(chat._id) === String(selectedUser._id)
      );

      if (!isFriend) {
        toast.error("You can only chat with friends");
        return state; // Don't update selectedUser
      }

      // Emit mark as read event
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    if (socket && authUser?._id) {
      socket.emit("markMessagesAsRead", {
        senderId: selectedUser._id,
        receiverId: authUser._id,
      });
    }

      const nextUnreadByUser = { ...state.unreadByUser };
      delete nextUnreadByUser[selectedUser._id];

      return {
        selectedUser,
        unreadByUser: nextUnreadByUser,
        isSelectedUserTyping: false,
      };
    }),

  // getAllContacts : async () => {

  //     set({isUsersLoading: true});
  //     try{
  //         const res = await axiosInstance.get("/message/contacts");
  //         set({allContacts: res.data});
  //     } catch (error) {
  //         toast.error(error.response?.data?.message || "Failed to fetch contacts");
  //     } finally {
  //         set({isUsersLoading: false});
  //     }

  // },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch chat partners",
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // getMessagesByUserId: async (userId) => {
  //   // SECURITY: Verify user is a friend before fetching messages
  //   const chats = get().chats || [];
  //   const isFriend = chats.some((chat) => String(chat._id) === String(userId));

  //   if (!isFriend) {
  //     toast.error("You can only view messages with friends");
  //     set({ messages: [] });
  //     return;
  //   }

  //   set({ isMessagesLoading: true });
  //   try {
  //     const res = await axiosInstance.get(`/message/${userId}`);
  //     set({ messages: res.data });
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to fetch messages");
  //   } finally {
  //     set({ isMessagesLoading: false });
  //   }
  // },

 getMessagesByUserId: async (userId, options = { reset: true }) => {
  const reset = options?.reset !== false;

  const chats = get().chats || [];
  const isFriend = chats.some((chat) => String(chat._id) === String(userId));

  if (!isFriend) {
    toast.error("You can only view messages with friends");
    set({
      messages: [],
      messageCursor: null,
      hasMoreMessages: true,
    });
    return;
  }

  if (reset) {
    set({
      isMessagesLoading: true,
      messages: [],
      messageCursor: null,
      hasMoreMessages: true,
    });
  } else {
    const state = get();
    if (!state.hasMoreMessages || state.isLoadingMoreMessages || !state.messageCursor) return;
    set({ isLoadingMoreMessages: true });
  }

  try {
    const state = get();

    const res = await axiosInstance.get("/message/" + userId, {
      params: {
        limit: 20,
        cursor: reset ? undefined : String(state.messageCursor),
      },
    });

    const incoming = Array.isArray(res.data?.messages) ? res.data.messages : [];
    const hasMore = Boolean(res.data?.hasMore);
    const nextCursor = res.data?.nextCursor ?? null;

    if (reset) {
      set({
        messages: incoming,
        hasMoreMessages: hasMore,
        messageCursor: nextCursor,
      });
    } else {
      // Deduplicate by _id while prepending older page
      set((prev) => {
        const seen = new Set(prev.messages.map((m) => String(m._id)));
        const uniqueIncoming = incoming.filter((m) => !seen.has(String(m._id)));

        return {
          messages: [...uniqueIncoming, ...prev.messages],
          hasMoreMessages: hasMore,
          messageCursor: nextCursor,
        };
      });
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch messages");
  } finally {
    if (reset) {
      set({ isMessagesLoading: false });
    } else {
      set({ isLoadingMoreMessages: false });
    }
  }
},

loadOlderMessages: async () => {
  const selectedUser = get().selectedUser;
  if (!selectedUser?._id) return;
  await get().getMessagesByUserId(selectedUser._id, { reset: false });
},


  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) {
      toast.error("No conversation selected");
      return;
    }

    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
    };

    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    if (!navigator.onLine) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg,
        ),
      }));
      toast.error("You are offline. Message marked as failed.");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData,
      );

      const serverMessage = {
        ...res.data,
        status: res.data?.status || "sent",
      };

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? serverMessage : msg,
        ),
      }));
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg,
        ),
      }));

      const isNetworkError = err.code === "ECONNABORTED" || !err.response;
      toast.error(
        isNetworkError
          ? "Message not sent. Check your connection and retry."
          : err.response?.data?.message || "Failed to send message",
      );
    }
  },

  retryMessage: async (messageId) => {
    const state = get();
    const message = state.messages.find((msg) => String(msg._id) === String(messageId));

    if (!message || message.status !== "failed") return;

    const { authUser } = useAuthStore.getState();
    if (!authUser?._id || String(message.senderId) !== String(authUser._id)) return;

    const selectedUserId = state.selectedUser?._id;
    const toUserId = message.receiverId || selectedUserId;
    if (!toUserId) return;

    set((prev) => ({
      messages: prev.messages.map((msg) =>
        String(msg._id) === String(messageId)
          ? { ...msg, status: "sending" }
          : msg,
      ),
    }));

    if (!navigator.onLine) {
      set((prev) => ({
        messages: prev.messages.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, status: "failed" }
            : msg,
        ),
      }));
      return;
    }

    try {
      const payload = {
        text: message.text || "",
        image: message.image || "",
      };

      const res = await axiosInstance.post(`/message/send/${toUserId}`, payload);
      const serverMessage = {
        ...res.data,
        status: res.data?.status || "sent",
      };

      set((prev) => ({
        messages: prev.messages.map((msg) =>
          String(msg._id) === String(messageId) ? serverMessage : msg,
        ),
      }));
    } catch (err) {
      set((prev) => ({
        messages: prev.messages.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, status: "failed" }
            : msg,
        ),
      }));

      const isNetworkError = err.code === "ECONNABORTED" || !err.response;
      toast.error(
        isNetworkError
          ? "Retry failed. You may still be offline."
          : err.response?.data?.message || "Failed to resend message",
      );
    }
  },

  retryFailedMessagesForSelectedUser: async () => {
    const state = get();
    const selectedUserId = state.selectedUser?._id;
    const { authUser } = useAuthStore.getState();

    if (!selectedUserId || !authUser?._id) return;

    const failedIds = state.messages
      .filter(
        (msg) =>
          msg.status === "failed" &&
          String(msg.senderId) === String(authUser._id) &&
          String(msg.receiverId) === String(selectedUserId),
      )
      .map((msg) => msg._id);

    for (const failedId of failedIds) {
      await get().retryMessage(failedId);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("typing:started");
    socket.off("typing:stopped");
    socket.off("messageStatusUpdated");
    socket.off("messagesRead");

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      if (!authUser?._id) return;
      if (String(newMessage.receiverId) !== String(authUser._id)) return;

      const selectedUser = get().selectedUser;
      const isSoundEnabled = get().isSoundEnabled;
      const senderId = String(newMessage.senderId);
      const isMessageSentFromSelectedUser =
        senderId === String(selectedUser?._id);
      const senderAlreadyInChats = (get().chats || []).some(
        (chat) => String(chat._id) === senderId,
      );
      if (!senderAlreadyInChats) {
        get().getMyChatPartners();
      }

      set((state) => {
        const chats = Array.isArray(state.chats) ? state.chats : [];
        const senderIndex = chats.findIndex(
          (chat) => String(chat._id) === senderId,
        );
        const reorderedChats =
          senderIndex > -1
            ? [
                chats[senderIndex],
                ...chats.filter((chat, index) => index !== senderIndex),
              ]
            : chats;

        if (isMessageSentFromSelectedUser) {
          // If chat is open, notify sender immediately that this message is read.
          socket.emit("markMessagesAsRead", {
            senderId,
            receiverId: String(authUser._id),
          });

          return {
            chats: reorderedChats,
            messages: [...state.messages, newMessage],
            isSelectedUserTyping: false,
          };
        }

        return {
          chats: reorderedChats,
          unreadByUser: {
            ...state.unreadByUser,
            [senderId]: (state.unreadByUser[senderId] || 0) + 1,
          },
        };
      });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((err) => console.log("Audio play failes ", err));
      }
    });

    socket.on("typing:started", ({ fromUserId } = {}) => {
      const selectedUser = get().selectedUser;
      if (!fromUserId || !selectedUser?._id) return;

      if (String(fromUserId) === String(selectedUser._id)) {
        set({ isSelectedUserTyping: true });
      }
    });

    socket.on("typing:stopped", ({ fromUserId } = {}) => {
      const selectedUser = get().selectedUser;
      if (!fromUserId || !selectedUser?._id) return;

      if (String(fromUserId) === String(selectedUser._id)) {
        set({ isSelectedUserTyping: false });
      }
    });

    // NEW: Listen for message status updates
    socket.on("messageStatusUpdated", ({ messageId, status }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          String(msg._id) === String(messageId) ? { ...msg, status } : msg
        ),
      }));
    });

    // NEW: Listen for read receipts
    socket.on("messagesRead", ({ senderId, receiverId }) => {
      const { authUser } = useAuthStore.getState();
      // This event is sent to the original sender, so auth user must match senderId.
      if (String(authUser?._id) === String(senderId)) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            String(msg.senderId) === String(senderId) &&
            String(msg.receiverId) === String(receiverId)
              ? { ...msg, status: "read" }
              : msg
          ),
        }));
      }
    });

  },

  // NEW: Update messages when user opens a chat
  markMessagesAsRead: async (selectedUserId) => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    
    if (!socket || !authUser?._id) return;

    // Emit socket event so sender knows messages are read
    socket.emit("markMessagesAsRead", {
      senderId: selectedUserId,
      receiverId: authUser._id,
    });
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing:started");
    socket.off("typing:stopped");
    socket.off("messageStatusUpdated");
    socket.off("messagesRead");
    set({ isSelectedUserTyping: false });
  },
}));
