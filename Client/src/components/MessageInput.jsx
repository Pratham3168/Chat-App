import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const TYPING_DEBOUNCE_MS = 1000;
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastTypingTargetRef = useRef(null);
  const { socket } = useAuthStore();

  const clearTypingTimer = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const emitTypingStart = () => {
    if (!socket || !selectedUser?._id) return;
    if (isTypingRef.current) return;

    socket.emit("typing:start", { toUserId: selectedUser._id });
    isTypingRef.current = true;
    lastTypingTargetRef.current = selectedUser._id;
  };

  const emitTypingStop = () => {
    if (!socket) return;
    if (!isTypingRef.current) return;

    const toUserId = lastTypingTargetRef.current;
    if (toUserId) {
      socket.emit("typing:stop", { toUserId });
    }

    isTypingRef.current = false;
    lastTypingTargetRef.current = null;
  };

  const handleTextChange = (event) => {
    const value = event.target.value;
    setText(value);

    if (isSoundEnabled) {
      playRandomKeyStrokeSound();
    }

    if (!value.trim()) {
      clearTypingTimer();
      emitTypingStop();
      return;
    }

    emitTypingStart();
    clearTypingTimer();

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, TYPING_DEBOUNCE_MS);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return; //don't send empty messages

    clearTypingTimer();
emitTypingStop();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; //reset file input
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; //reset file input
    }
  };

  useEffect(() => {
    return () => {
      clearTypingTimer();
      emitTypingStop();
    };
  }, [selectedUser?._id, socket]);

  return (
    <div className="border-t border-slate-700/50 bg-slate-900/40 p-3">
      {imagePreview && (
        <div className="mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          className="min-w-0 flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-500/60"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`shrink-0 rounded-lg bg-slate-800/50 px-3 py-2 text-slate-400 transition-colors hover:text-slate-200 ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="shrink-0 rounded-lg bg-linear-to-r from-cyan-500 to-cyan-600 px-3 py-2 font-medium text-white transition-all hover:from-cyan-600 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
