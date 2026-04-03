import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, MessageCircle, Search, UserPlus } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";
import { useFriendStore } from "../stores/useFriendStore";

function SearchUser({ minChars = 2, debounceMs = 400 }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingIds, setSendingIds] = useState([]);

  const { authUser } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const {
    fetchFriendData,
    getRelationshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    isLoading: isFriendDataLoading,
  } = useFriendStore();

  useEffect(() => {
    fetchFriendData();
  }, [fetchFriendData]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();

      if (trimmed.length < minChars) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await axiosInstance.get("/message/contacts");
        const users = Array.isArray(res.data) ? res.data : [];
        const keyword = trimmed.toLowerCase();

        const filtered = users
          .filter((user) => user._id !== authUser?._id)
          .filter((user) => {
            const name = (user.fullName || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(keyword) || email.includes(keyword);
          })
          .map((user) => {
            const relationshipStatus = getRelationshipStatus(user._id);

            const incomingRequest = useFriendStore
              .getState()
              .incomingRequests.find((request) => request.senderId?._id === user._id);

            return {
              ...user,
              relationshipStatus,
              incomingRequestId: incomingRequest?._id,
            };
          });

        setSearchResults(filtered);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, minChars, debounceMs, authUser?._id, getRelationshipStatus]);

  const showSearchHint = useMemo(
    () => query.trim().length > 0 && query.trim().length < minChars,
    [query, minChars]
  );

  const results = searchResults;
  const isLoading = isFriendDataLoading || isSearching;

  const getIncomingRequestId = (userId) => {
    return useFriendStore.getState().incomingRequests.find((request) => request.senderId?._id === userId)?._id;
  };

  const handleSendRequest = async (user) => {
    if (sendingIds.includes(user._id)) return;

    setSendingIds((current) => [...current, user._id]);

    try {
      await sendFriendRequest(user._id);
    } finally {
      setSendingIds((current) => current.filter((id) => id !== user._id));
    }
  };

  const renderAction = (user) => {
    const liveStatus = user.relationshipStatus || getRelationshipStatus(user._id);
    const status = sendingIds.includes(user._id) ? "sending" : liveStatus;

    if (status === "friends") {
      return (
        <button
          onClick={() => setSelectedUser(user)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
        >
          <MessageCircle size={15} />
          Message
        </button>
      );
    }

    if (status === "sending" || status === "outgoing") {
      return (
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-sm cursor-not-allowed opacity-90"
        >
          <Clock3 size={15} />
          {/* {status === "sending" ? "Sending..." : "Request Sent"} */}
        </button>
      );
    }

    if (status === "incoming") {
      const incomingRequestId = user.incomingRequestId || getIncomingRequestId(user._id);

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => acceptFriendRequest(incomingRequestId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm"
          >
            <Check size={15} />
            Accept
          </button>
          <button
            onClick={() => rejectFriendRequest(incomingRequestId)}
            className="px-3 py-1.5 rounded-md bg-slate-700/70 text-slate-200 hover:bg-slate-700 transition-colors text-sm"
          >
            Reject
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleSendRequest(user)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm"
      >
        <UserPlus size={15} />
        {/* Add Friend */}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name or email"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {showSearchHint && (
        <p className="text-xs text-slate-400">Type at least {minChars} characters to search.</p>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
          <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
          <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
        </div>
      )}

      {!isLoading && query.trim().length >= minChars && results.length === 0 && (
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-4 text-sm text-slate-400">
          No users found.
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user._id}
              className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="avatar">
                    <div className="size-11 rounded-full">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-slate-100 font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="shrink-0">{renderAction(user)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchUser;
