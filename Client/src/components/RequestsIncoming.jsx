import { useEffect, useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { useFriendStore } from "../stores/useFriendStore";

function RequestsIncoming() {
  const { incomingRequests, getIncomingRequests, acceptFriendRequest, rejectFriendRequest } = useFriendStore();
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadIncoming = async () => {
      setIsLoading(true);
      try {
        await getIncomingRequests();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadIncoming();

    return () => {
      mounted = false;
    };
  }, [getIncomingRequests]);

  const withProcessing = async (requestId, action) => {
    if (!requestId || processingIds.includes(requestId)) return;

    setProcessingIds((prev) => [...prev, requestId]);
    try {
      await action(requestId);
      await getIncomingRequests();
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
        <div className="h-16 rounded-lg bg-slate-800/70 animate-pulse" />
      </div>
    );
  }

  if (!incomingRequests?.length) {
    return (
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-5 text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-300">
          <Inbox size={18} />
        </div>
        <p className="text-sm text-slate-300">No incoming requests</p>
        <p className="text-xs text-slate-500 mt-1">When someone sends you a request, it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {incomingRequests.map((request) => {
        const sender = request.senderId;
        const isProcessing = processingIds.includes(request._id);

        return (
          <div
            key={request._id}
            className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <div className="avatar">
                  <div className="size-11 rounded-full">
                    <img src={sender?.profilePic || "/avatar.png"} alt={sender?.fullName || "User"} />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-slate-100 font-medium truncate">{sender?.fullName || "Unknown User"}</p>
                  <p className="text-xs text-slate-400 truncate">{sender?.email || "No email"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => withProcessing(request._id, acceptFriendRequest)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={15} />
                  {/* Accept */}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => withProcessing(request._id, rejectFriendRequest)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-700/70 text-slate-200 hover:bg-slate-700 transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={15} />
                  {/* Reject */}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RequestsIncoming;
