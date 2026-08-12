"use client";

import React, { useState, useRef } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  errorMsg: string;
}

export default function UploadZone({ onFileSelect, errorMsg }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center p-8 border border-dashed rounded-sm min-h-[220px] transition-all cursor-pointer select-none text-center bg-black/20 ${
        dragActive
          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,81,0,0.1)]"
          : "border-sand/20 hover:border-primary/50"
      }`}
      onClick={onButtonClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center gap-3">
        <svg
          className={`w-10 h-10 transition-colors ${dragActive ? "text-primary animate-bounce" : "text-muted"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-widest text-white uppercase">
            {selectedFileName ? "PHOTO DETECTED" : "UPLOAD BUILDER PHOTO"}
          </span>
          <span className="text-[9px] text-muted font-mono uppercase">
            {selectedFileName
              ? selectedFileName
              : "Drag & drop your file or click to select"}
          </span>
          <span className="text-[8px] text-muted/65 font-mono">
            JPG · PNG · HEIC (MAX 15 MB)
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-2 border border-primary/40 bg-primary/5 text-primary text-[9px] font-bold font-mono tracking-wider rounded-sm animate-pulse uppercase">
          &gt; {errorMsg}
        </div>
      )}
    </div>
  );
}
