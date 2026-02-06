"use client";

import { useCallback, useState } from "react";

interface PhotoUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ onFileSelected, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setPreview(URL.createObjectURL(file));
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        dragOver
          ? "border-npc-accent bg-npc-accent/5"
          : "border-rust-700/50 hover:border-rust-500"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp,image/gif";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      {preview ? (
        <div className="space-y-4">
          <img
            src={preview}
            alt="Fish preview"
            className="max-h-64 mx-auto rounded-lg border border-rust-700/30"
          />
          <p className="text-sm text-npc-text/50">Click or drop to replace</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-lg text-npc-text mb-1">
              Drop your catch here, survivor
            </p>
            <p className="text-sm text-npc-text/40">
              JPG, PNG, WebP, or GIF — max 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
