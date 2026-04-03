import { useChatStore } from "../stores/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
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

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full h-full">
      <BorderAnimatedContainer>

        <div>
          <Sidebar />
        </div>

        {/* LEFT SIDE */}
        <div className="w-[20%] bg-slate-800/50 backdrop-blur-sm flex flex-col">
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
            {activeTab === "settings" && <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;