import { create } from "zustand";


export const useAuthStore = create((set) =>({
    authUser:{name:"Wick" , _id:"1234" , age:34},
    isLoading:false,

    login:()=>{
        console.log("Login function called");
    },
}));