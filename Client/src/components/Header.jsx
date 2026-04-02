import { VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useChatStore } from "../stores/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function Header() {
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="px-6 py-4 border-b border-[#1e293b] bg-[#020617]">
      
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <h1 className="text-xl font-semibold text-white tracking-wide">
          Chat App
        </h1>

        {/* RIGHT BUTTONS */}
        <div className="flex items-center gap-3">

          {/* SOUND TOGGLE */}
          <button
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch(() => {});
              toggleSound();
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Header;