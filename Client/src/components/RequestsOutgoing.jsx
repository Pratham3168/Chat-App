import { useEffect, useState } from "react";
import { Clock3, Inbox } from "lucide-react";
import { useFriendStore } from "../stores/useFriendStore";

function RequestsOutgoing() {
  const { outgoingRequests, getOutgoingRequests } = useFriendStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOutgoing = async () => {
      setIsLoading(true);
      try {
        await getOutgoingRequests();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadOutgoing();

    return () => {
      mounted = false;
    };
  }, [getOutgoingRequests]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
      </div>
    );
  }

  if (!outgoingRequests?.length) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-5 text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-300">
          <Inbox size={18} />
        </div>
        <p className="text-sm text-slate-300">No outgoing requests</p>
        <p className="text-xs text-slate-500 mt-1">When you send someone a request, it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {outgoingRequests.map((request) => {
        const receiver = request.receiverId;

        return (
          <div
            key={request._id}
            className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <div className="avatar">
                  <div className="size-11 rounded-full">
                    <img src={receiver?.profilePic || "/avatar.png"} alt={receiver?.fullName || "User"} />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-slate-100 font-medium truncate">{receiver?.fullName || "Unknown User"}</p>
                  <p className="text-xs text-slate-400 truncate">{receiver?.email || "No email"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Clock3 size={15} className="text-amber-400" />
                <span className="text-xs text-amber-300">Pending</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RequestsOutgoing;
