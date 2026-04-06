import React, { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from "react-router";
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './stores/useAuthStore';
import PageLoader from './components/PageLoader';
import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();
  const isChatRoute = location.pathname === "/";

  const {checkAuth,authUser, isCheckingAuth} = useAuthStore();

  useEffect(() =>{
    checkAuth();
  }, [checkAuth]);

  if(isCheckingAuth) return <PageLoader />

  console.log("authUser: ", authUser);

  return (

     <div
      className={`min-h-screen bg-slate-900 relative overflow-hidden ${
        isChatRoute ? "h-dvh" : "flex items-center justify-center p-4"
      }`}
    >
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-green-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
    
      <div className={`relative z-10 w-full ${isChatRoute ? "h-full" : ""}`}>
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
        </Routes>
      </div>

      <Toaster />
    </div>
  )
}

export default App
