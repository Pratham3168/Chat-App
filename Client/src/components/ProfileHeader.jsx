import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setImageFileUploadProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    let fakeProgress = 0;

    const progressInterval = setInterval(() => {
      fakeProgress += Math.floor(Math.random() * 10) + 1;

      if (fakeProgress >= 95) {
        fakeProgress = 95;
        clearInterval(progressInterval);
      }

      setImageFileUploadProgress(fakeProgress);
    }, 400);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);

      try {
        await updateProfile({ profilePic: base64Image });

        // COMPLETE progress after success
        setImageFileUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
        }, 400); // small delay so 100% is visible
      } catch (err) {
        setIsUploading(false);
        setImageFileUploadProgress(0);
      }
    };
  };

  return (
    <div className="p-6 border-b border-slate-700/50 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <div className="size-14 rounded-full overflow-hidden relative group">
              {/* IMAGE */}
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />

              {/* LOADER (Step 3 goes HERE) */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-10 h-10">
                    <div className="w-full h-full rounded-full border-2 border-slate-300 flex items-center justify-center text-white text-[10px] font-semibold">
                      {imageFileUploadProgress}%
                    </div>
                    <p className="text-white text-xs text-center mt-1">
                      {imageFileUploadProgress}%
                    </p>
                  </div>
                </div>
              )}

              {/* CLICK / HOVER */}
              {!isUploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <span className="text-white text-xs">Change</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser?.fullName}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* LOGOUT BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
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
export default ProfileHeader;
