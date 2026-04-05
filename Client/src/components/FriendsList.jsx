import { useEffect, useState } from "react";
import { UserMinus } from "lucide-react";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useAuthStore } from "../stores/useAuthStore";
import { useFriendStore } from "../stores/useFriendStore";
import { useChatStore } from "../stores/useChatStore";

function FriendsList() {
  const { friends, getMyFriends, removeFriend, isLoading } = useFriendStore();
  const { onlineUsers } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const [removingIds, setRemovingIds] = useState([]);

  useEffect(() => {
    getMyFriends();
  }, [getMyFriends]);

  const handleRemoveFriend = async (event, friendId) => {
    event.stopPropagation();
    if (!friendId || removingIds.includes(friendId)) return;

    setRemovingIds((prev) => [...prev, friendId]);
    try {
      await removeFriend(friendId);
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== friendId));
    }
  };

  if (isLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {friends.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "avatar-online" : "avatar-offline"}`}>
                <div className="size-12 rounded-full">
                  <img src={contact.profilePic || "/avatar.png"} />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
            </div>

            <button
              type="button"
              disabled={removingIds.includes(contact._id)}
              onClick={(event) => handleRemoveFriend(event, contact._id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserMinus size={14} />
              Remove
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
export default FriendsList;