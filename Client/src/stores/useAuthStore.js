import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendStore } from "./useFriendStore";



const BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://localhost:3000"
        : undefined;

export const useAuthStore = create((set,get) =>({
    authUser:null,
    socket:null,
    onlineUsers:[],
    isCheckingAuth:true,
    isSigningUp:false,
    isLoggingIn:false,


    checkAuth : async() => {
        try{

            const res = await axiosInstance.get("/auth/check");
            set({authUser:res.data});
            get().connectSocket(); // Connect to socket after confirming user is authenticated
        }catch(err){
            // 401 means the user is not logged in yet; treat it as a normal state.
            if (err?.response?.status !== 401) {
                console.log("Error in checking Auth : ",err);
            }
            set({authUser:null});
        }finally{
            set({isCheckingAuth:false});
        }
    },

    signup : async(data) => {

        set({isSigningUp:true});

        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser:res.data});
            toast.success("Signup successful! Welcome aboard.");
            get().connectSocket(); // Connect to socket after successful signup
        }catch(err){
            toast.error(err?.response?.data?.message || "Signup failed");
            console.log("Error in Signup : ",err);
        }finally{
            set({isSigningUp:false});
        }

    },

    login : async (data) => {

        set({isLoggingIn:true});

        try{
            const res = await axiosInstance.post("/auth/login", data);
            set({authUser:res.data});
            get().connectSocket(); // Connect to socket after successful login
            toast.success("Login successful! Welcome back.");
        }
        catch(err){ 
            toast.error(err?.response?.data?.message || "Login failed");
            console.log("Error in Login : ",err);
        }finally{
            set({isLoggingIn:false});
        }

    },


    logout : async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully.");
            get().disconnectSocket(); // Disconnect from socket on logout
        }catch(err){
            toast.error("Logout failed. Please try again.");
            console.log("Error in Logout : ",err);
        }
    },


    updateProfile: async (data) => {
        try {
        const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error.response.data.message);
        }
    },

    
    connectSocket : () => {
        const { authUser, socket: existingSocket } = get();

        // Only connect when authenticated and there isn't already an active socket.
        if(!authUser || existingSocket?.connected){
            return ;
        }

        const socket = io(BASE_URL, {
            withCredentials : true, //this ensures that cookies are sent with the socket connection
        }); 

        socket.connect();
        set({socket});

        socket.on("connect_error", (err) => {
            console.log("Socket connect_error:", err.message);
        });

        socket.on("getOnlineUsers",(userIds) => {
            set({onlineUsers:userIds});
        });

        socket.on("friend:request:created", (payload) => {
            useFriendStore.getState().handleFriendRequestCreated(payload);
        });

        socket.on("friend:request:accepted", (payload) => {
            useFriendStore.getState().handleFriendRequestAccepted(payload, get().authUser?._id);
        });
    },

    disconnectSocket : () => {
        const { socket } = get();
        if(socket?.connected){
            socket.disconnect();
        }

        set({ socket: null, onlineUsers: [] });
    },

}));