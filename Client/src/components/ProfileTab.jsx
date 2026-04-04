import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";

function ProfileTab() {
	const { authUser, updateProfile } = useAuthStore();
	const [fullName, setFullName] = useState(authUser?.fullName || "");
	const [preview, setPreview] = useState(authUser?.profilePic || "/avatar.png");
	const [selectedImg, setSelectedImg] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const uploadIntervalRef = useRef(null);

	useEffect(() => {
		setFullName(authUser?.fullName || "");
		setPreview(authUser?.profilePic || "/avatar.png");
	}, [authUser?.fullName, authUser?.profilePic]);

	useEffect(() => {
		return () => {
			if (uploadIntervalRef.current) {
				clearInterval(uploadIntervalRef.current);
				uploadIntervalRef.current = null;
			}
		};
	}, []);

	const hasNameChange = useMemo(() => {
		const current = authUser?.fullName || "";
		return fullName.trim().length >= 2 && fullName.trim() !== current;
	}, [fullName, authUser?.fullName]);

	const canSave = hasNameChange || selectedImg;

	const handleImageUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (uploadIntervalRef.current) {
			clearInterval(uploadIntervalRef.current);
			uploadIntervalRef.current = null;
		}

		setIsUploading(true);
		setImageFileUploadProgress(0);

		const reader = new FileReader();
		reader.readAsDataURL(file);

		let fakeProgress = 0;

		uploadIntervalRef.current = setInterval(() => {
			fakeProgress += Math.floor(Math.random() * 10) + 1;

			if (fakeProgress >= 95) {
				fakeProgress = 95;
				clearInterval(uploadIntervalRef.current);
				uploadIntervalRef.current = null;
			}

			setImageFileUploadProgress(fakeProgress);
		}, 400);

		reader.onloadend = () => {
			const base64Image = reader.result;
			if (typeof base64Image !== "string") {
				if (uploadIntervalRef.current) {
					clearInterval(uploadIntervalRef.current);
					uploadIntervalRef.current = null;
				}
				setIsUploading(false);
				setImageFileUploadProgress(0);
				return;
			}

			setSelectedImg(base64Image);
			setPreview(base64Image);

			if (uploadIntervalRef.current) {
				clearInterval(uploadIntervalRef.current);
				uploadIntervalRef.current = null;
			}

			setImageFileUploadProgress(100);
			setTimeout(() => {
				setIsUploading(false);
			}, 250);
		};

		reader.onerror = () => {
			if (uploadIntervalRef.current) {
				clearInterval(uploadIntervalRef.current);
				uploadIntervalRef.current = null;
			}
			setIsUploading(false);
			setImageFileUploadProgress(0);
		};
	};

	const handleSubmit = async (e) => {
	e.preventDefault();
	if (!canSave) return;

	const payload = {};

	if (hasNameChange) payload.fullName = fullName.trim();
	if (selectedImg) payload.profilePic = selectedImg;

	try {
		setIsSaving(true);
		await updateProfile(payload);
		setSelectedImg("");
	} finally {
		setIsSaving(false);
	}
};
	return (
		<form onSubmit={handleSubmit} className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-4">
			<h3 className="text-sm font-semibold text-slate-200">Profile Settings</h3>

			<div className="flex items-center gap-4">
				<div className="relative">
					<img
						src={preview || "/avatar.png"}
						alt="Profile preview"
						className="size-16 rounded-full object-cover border border-slate-600"
					/>
					<label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 text-slate-900 cursor-pointer hover:bg-cyan-400 transition-colors">
						<Camera size={14} />
						<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
					</label>
				</div>

				<div className="min-w-0">
					<p className="text-sm text-slate-200 truncate">{authUser?.email}</p>
					<p className="text-xs text-slate-400">Click camera icon to change photo</p>
				</div>
			</div>

			{isUploading && (
				<div className="space-y-2">
					<div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
						<div
							className="h-full bg-cyan-500 transition-all duration-300"
							style={{ width: `${imageFileUploadProgress}%` }}
						/>
					</div>
					<p className="text-xs text-slate-400">Uploading image... {imageFileUploadProgress}%</p>
				</div>
			)}

			<div className="space-y-1">
				<label htmlFor="fullName" className="text-xs uppercase tracking-wide text-slate-400">
					Full Name
				</label>
				<input
					id="fullName"
					type="text"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					placeholder="Enter your name"
					className="w-full rounded-lg bg-slate-800/60 border border-slate-700 py-2.5 px-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				disabled={!canSave || isSaving}
				className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-900 font-medium hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				<Save size={16} />
				{isSaving ? "Saving..." : "Save Changes"}
			</button>
		</form>
	);
}

export default ProfileTab;
