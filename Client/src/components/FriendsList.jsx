import { useEffect } from "react";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";
import { useFriendStore } from "../stores/useFriendStore";
import { useChatStore } from "../stores/useChatStore";

function FriendsList() {
  const { friends, getMyFriends, isLoading } = useFriendStore();
  const { onlineUsers } = useAuthStore();
  const { setSelectedUser } = useChatStore();

  useEffect(() => {
    getMyFriends();
  }, [getMyFriends]);

  if (isLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {friends.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "avatar-online" : "avatar-offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default FriendsList;