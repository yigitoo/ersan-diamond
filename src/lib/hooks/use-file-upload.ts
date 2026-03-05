"use client";

import { useState, useCallback } from "react";

export interface UploadedFile {
  id: string;
  file: File;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  key: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export interface AttachmentMeta {
  filename: string;
  contentType: string;
  size: number;
  url: string;
  key: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 10;

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploading = files.some((f) => f.status === "uploading" || f.status === "pending");

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = newFiles.slice(0, remaining);

      const entries: UploadedFile[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        url: "",
        key: "",
        progress: 0,
        status: "pending" as const,
      }));

      // Validate
      for (const entry of entries) {
        if (entry.size > MAX_FILE_SIZE) {
          entry.status = "error";
          entry.error = "Dosya 25MB limitini aşıyor";
        }
      }

      // Start uploads for valid files
      const validEntries = entries.filter((e) => e.status === "pending");
      for (const entry of validEntries) {
        uploadFile(entry);
      }

      return [...prev, ...entries];
    });
  }, []);

  const uploadFile = async (entry: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" as const } : f))
    );

    try {
      // Upload via XHR to our server-side proxy (avoids R2 CORS issues)
      await new Promise<{ url: string; key: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/attachment");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.id === entry.id ? { ...f, progress } : f))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.success && json.data) {
                resolve({ url: json.data.url, key: json.data.key });
              } else {
                reject(new Error(json.error || "Yükleme hatası"));
              }
            } catch {
              reject(new Error("Geçersiz yanıt"));
            }
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.error || `Hata: ${xhr.status}`));
            } catch {
              reject(new Error(`Hata: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Bağlantı hatası"));

        const formData = new FormData();
        formData.append("file", entry.file);
        xhr.send(formData);
      }).then(({ url, key }) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "done" as const, progress: 100, url, key }
              : f
          )
        );
      });
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "error" as const, error: err.message || "Yükleme hatası" }
            : f
        )
      );
    }
  };

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const getAttachmentMetas = useCallback((): AttachmentMeta[] => {
    return files
      .filter((f) => f.status === "done")
      .map(({ filename, contentType, size, url, key }) => ({
        filename,
        contentType,
        size,
        url,
        key,
      }));
  }, [files]);

  return { files, uploading, addFiles, removeFile, clearFiles, getAttachmentMetas };
}
