import toast from 'react-hot-toast';
import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set,get) => ({
    allContacts : [],
    chats: [],
    messages: [],
    activeTab : "chats",
    isUsersLoading: false,
    selectedUser: null,
    isMessagesLoading: false,
    isSoundEnabled : JSON.parse(localStorage.getItem("isSoundEnabled")) === true ,


    toggleSound:() => {
        localStorage.setItem("isSoundEnabled",!get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser }),


    getAllContacts : async () => {

        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/message/contacts");
            set({allContacts: res.data});
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch contacts");
        } finally {
            set({isUsersLoading: false});
        }

    },


    getMyChatPartners : async () => {
        set({isUsersLoading: true});

        try{
            const res = await axiosInstance.get("/message/chats");
            set({chats: res.data});
        }
        catch(error){
            toast.error(error.response?.data?.message || "Failed to fetch chat partners");
        }
        finally{
            set({isUsersLoading: false});
        }
    },


    getMessagesByUserId : async (userId) => {
        set({isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/message/${userId}`);
            set({messages: res.data});
        }catch(error){
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        }finally{
            set({isMessagesLoading: false});
        }
    },

    sendMessage : async (messageData) => {

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
            isOptimistic: true,
        };

        set((state) => ({ messages: [...state.messages, optimisticMessage] }));

        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            set((state) => ({
                messages: state.messages.map((msg) => (msg._id === tempId ? res.data : msg)),
            }));
        } catch (err) {
            set((state) => ({ messages: state.messages.filter((msg) => msg._id !== tempId) }));
            toast.error(err.response?.data?.message || "Failed to send message");
        }

    }

   

}))