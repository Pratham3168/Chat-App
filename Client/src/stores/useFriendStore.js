import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useFriendStore = create((set, get) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,

  // 🔹 Fetch friends only
  getMyFriends: async () => {
    try {
      const res = await axiosInstance.get("/friend/list");
      set({ friends: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends");
    }
  },

  // 🔹 Fetch incoming requests only
  getIncomingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friend/incoming");
      set({ incomingRequests: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load incoming requests");
    }
  },

  // 🔹 Fetch outgoing requests only
  getOutgoingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friend/outgoing");
      set({ outgoingRequests: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load outgoing requests");
    }
  },

  // 🔹 Fetch everything
  fetchFriendData: async () => {
    set({ isLoading: true });
    try {
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        axiosInstance.get("/friend/list"),
        axiosInstance.get("/friend/incoming"),
        axiosInstance.get("/friend/outgoing"),
      ]);

      set({
        friends: friendsRes.data || [],
        incomingRequests: incomingRes.data || [],
        outgoingRequests: outgoingRes.data || [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 Send request
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friend/send/${userId}`);
      toast.success("Request sent");
      await get().fetchFriendData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  // 🔹 Accept request
  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friend/${requestId}/accept`);
      toast.success("Accepted");
      await get().fetchFriendData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  },

  // 🔹 Reject request
  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friend/${requestId}/reject`);
      toast.success("Rejected");
      await get().fetchFriendData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  },

  // 🔹 Cancel outgoing request
  cancelFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friend/${requestId}/cancel`);
      toast.success("Cancelled");
      await get().fetchFriendData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  },

  // 🔹 THIS is the only helper you need
  getRelationshipStatus: (userId) => {
    const { friends, incomingRequests, outgoingRequests } = get();

    // ✅ check friends
    if (friends.some((f) => f._id === userId)) {
      return "friends";
    }

    // ✅ check incoming
    if (incomingRequests.some((r) => r.senderId._id === userId)) {
      return "incoming";
    }

    // ✅ check outgoing
    if (outgoingRequests.some((r) => r.receiverId._id === userId)) {
      return "outgoing";
    }

    return "none";
  },

  resetFriendState: () =>
    set({
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      isLoading: false,
    }),
}));