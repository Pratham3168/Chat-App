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

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
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
      status: "sent",
      isOptimistic: true,
    };

    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData,
      );
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? res.data : msg,
        ),
      }));
    } catch (err) {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      toast.error(err.response?.data?.message || "Failed to send message");
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
