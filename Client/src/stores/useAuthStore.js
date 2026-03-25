import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";


export const useAuthStore = create((set) =>({
    authUser:null,
    isCheckingAuth:true,
    isSigningUp:false,
    isLoggingIn:false,

    checkAuth : async() => {
        try{

            const res = await axiosInstance.get("/auth/check");
            set({authUser:res.data});
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
        }catch(err){
            toast.error("Logout failed. Please try again.");
            console.log("Error in Logout : ",err);
        }
    }

}));