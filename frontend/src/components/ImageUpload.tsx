"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { uploadImage, getErrorMessage } from "@/lib/api";

interface Props {
  label?: string;
  value: string; // current image URL, empty string if none
  onChange: (url: string) => void;
  helpText?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function ImageUpload({ label, value, onChange, helpText, onUploadingChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > MAX_FILE_SIZE) {
      setError("Image is too large — max size is 2MB");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      {helpText && <p className="mb-2 text-xs text-slate-light">{helpText}</p>}

      {value ? (
        <div className="relative inline-block">
          <div className="relative h-28 w-28 overflow-hidden rounded-md border border-line bg-ink-50">
            <Image src={value} alt="" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-ink p-1 text-paper"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line text-slate hover:border-ink hover:text-ink"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="text-xs">{uploading ? "Uploading…" : "Upload"}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {error && <p className="mt-1.5 text-xs text-brick">{error}</p>}
    </div>
  );
}
