"use client";

import { useRef, useState, useCallback } from "react";
import { Paperclip, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

interface AttachmentDropZoneProps {
  mode: "full" | "compact";
  onFiles: (files: FileList) => void;
  disabled?: boolean;
}

const ACCEPT =
  "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.mp4,.mov,.mp3,.wav";

export function AttachmentDropZone({ mode, onFiles, disabled }: AttachmentDropZoneProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFiles(e.target.files);
        e.target.value = ""; // reset so same file can be re-selected
      }
    },
    [onFiles]
  );

  if (mode === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="p-2 text-mist hover:text-brand-white transition-colors disabled:opacity-50"
          title={t("Dosya ekle", "Attach file")}
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleChange}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-sm cursor-pointer transition-colors",
        dragOver
          ? "border-brand-gold bg-brand-gold/5"
          : "border-slate/40 hover:border-slate"
      )}
    >
      <Upload size={16} className="text-mist" />
      <span className="text-xs text-mist">
        {t("Dosyaları sürükleyin veya tıklayarak seçin", "Drag files or click to select")}
      </span>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
