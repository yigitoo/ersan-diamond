"use client";

import {
  FileText, Image, FileSpreadsheet, Film, Music, Archive, File, Download, X,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface AttachmentChipProps {
  filename: string;
  size: number;
  contentType: string;
  url?: string;
  progress?: number;
  status?: "pending" | "uploading" | "done" | "error";
  error?: string;
  onRemove?: () => void;
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return Image;
  if (contentType.startsWith("video/")) return Film;
  if (contentType.startsWith("audio/")) return Music;
  if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType === "text/csv")
    return FileSpreadsheet;
  if (contentType.includes("zip") || contentType.includes("rar")) return Archive;
  if (contentType.includes("pdf") || contentType.includes("word") || contentType.includes("document") || contentType === "text/plain")
    return FileText;
  return File;
}

export function AttachmentChip({
  filename,
  size,
  contentType,
  url,
  progress = 0,
  status = "done",
  error,
  onRemove,
}: AttachmentChipProps) {
  const Icon = getFileIcon(contentType);
  const isUploading = status === "uploading" || status === "pending";
  const isError = status === "error";

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-sm border text-sm overflow-hidden",
        isError
          ? "border-red-500/40 bg-red-500/5"
          : "border-slate bg-charcoal/50"
      )}
    >
      {/* Progress bar background */}
      {isUploading && (
        <div
          className="absolute inset-0 bg-brand-gold/10 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}

      <Icon size={16} className={cn("shrink-0 relative z-10", isError ? "text-red-400" : "text-mist")} />

      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-xs truncate text-brand-white/80">{filename}</p>
        <p className="text-[10px] text-mist">
          {isError ? (error || "Hata") : isUploading ? `${progress}%` : formatFileSize(size)}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative z-10">
        {/* Download button (read-only mode) */}
        {status === "done" && url && !onRemove && (
          <a
            href={url}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-mist hover:text-brand-white transition-colors"
          >
            <Download size={14} />
          </a>
        )}

        {/* Remove button (compose mode) */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-mist hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
