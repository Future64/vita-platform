"use client";

import { useState, useRef } from "react";
import { Camera, Trash2 } from "lucide-react";

interface PhotoUploadProps {
  currentPhoto?: string;
  initials: string;
  onPhotoChange: (photo: string | null) => void;
  size?: number;
}

export function PhotoUpload({ currentPhoto, initials, onPhotoChange, size = 120 }: PhotoUploadProps) {
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La photo ne doit pas depasser 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onPhotoChange(reader.result as string);
      setShowMenu(false);
    };
    reader.readAsDataURL(file);
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Avatar circle */}
      <div
        className="group relative flex items-center justify-center rounded-full overflow-hidden cursor-pointer"
        style={{ width: size, height: size }}
        onClick={() => setShowMenu(!showMenu)}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt="Photo de profil"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-pink-500 text-white font-bold"
            style={{ fontSize: size * 0.25 }}
          >
            {initials}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-48 rounded-lg border shadow-lg"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <button
            onClick={() => {
              inputRef.current?.click();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] rounded-t-lg transition-colors"
          >
            <Camera className="h-4 w-4" />
            Telecharger une photo
          </button>
          {currentPhoto && (
            <button
              onClick={() => {
                onPhotoChange(null);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-b-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer la photo
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
