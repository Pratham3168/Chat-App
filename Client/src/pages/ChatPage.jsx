import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFriendStore } from "../stores/useFriendStore";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import SearchUser from "../components/SearchUser";
import RequestsIncoming from "../components/RequestsIncoming";
import RequestsOutgoing from "../components/RequestsOutgoing";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import Sidebar from "../components/SideBar.jsx";
import Header from "../components/Header.jsx";
import FriendsList from "../components/FriendsList.jsx";
import ProfileTab from "../components/ProfileTab.jsx";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeToMessages, getMyChatPartners } = useChatStore();
  const { socket } = useAuthStore();
  const { getIncomingRequests } = useFriendStore();

  useEffect(() => {
    subscribeToMessages();

    return () => {
      unsubscribeToMessages();
    };
  }, [socket, subscribeToMessages, unsubscribeToMessages]);

  useEffect(() => {
    getIncomingRequests();
  }, [getIncomingRequests]);

  useEffect(() => {
    if (socket?.connected) {
      getMyChatPartners();
    }

    const handleSocketConnect = () => {
      getMyChatPartners();
    };

    socket?.on("connect", handleSocketConnect);

    return () => {
      socket?.off("connect", handleSocketConnect);
    };
  }, [socket, getMyChatPartners]);

  return (
    <div className="relative h-full w-full min-h-0">
      <div className="flex h-full w-full overflow-hidden rounded-none bg-slate-900/50 backdrop-blur-sm">
        <Sidebar />

        {/* LEFT SIDE */}
        <div
          className={`bg-slate-800/50 backdrop-blur-sm flex-col pb-16 lg:pb-0 lg:flex lg:w-[20%] ${
            selectedUser ? "hidden lg:flex" : "flex w-full"
          }`}
        >
          {/* <ProfileHeader /> */}
          <Header />
          {/* <ActiveTabSwitch /> */}

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" && <ChatsList />}
            {/* {activeTab === "contacts" && <ContactList />} */}
            {activeTab === "friends" && <FriendsList />}
            {activeTab === "search" && <SearchUser />}
            {activeTab === "requests" && (
              <>
                <h3 className="text-xs uppercase tracking-wide text-slate-400 px-1">Incoming</h3>
                <RequestsIncoming />
                <h3 className="text-xs uppercase tracking-wide text-slate-400 px-1 pt-2">Outgoing</h3>
                <RequestsOutgoing />
              </>
            )}
            {(activeTab === "profile" || activeTab === "settings") && <ProfileTab />}
            {/* Privacy-first mode: disable broad contacts list in UI */}
            {/* {activeTab === "settings" && <ContactList />} */}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className={`flex-1 flex-col bg-slate-900/50 backdrop-blur-sm min-h-0 min-w-0 pb-16 lg:pb-0 ${
            selectedUser ? "flex w-full" : "hidden lg:flex"
          }`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;