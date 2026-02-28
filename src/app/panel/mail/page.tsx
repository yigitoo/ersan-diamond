"use client";

import { useState, useCallback, useEffect } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/pagination";
import { formatRelative, formatDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Mail, Send, Search, Reply, User, Archive, ArchiveRestore, Eye, EyeOff, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function MailPage() {
  const { mutate } = useSWRConfig();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Compose dialog
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", text: "" });
  const [composeErrors, setComposeErrors] = useState<Record<string, string>>({});
  const [composeSending, setComposeSending] = useState(false);

  // Thread detail sheet
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading } = useSwrPaginated("/api/mail", { page, limit: 20, search: search || undefined });
  const allThreads = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  // Client-side filtering: hide ARCHIVED/CLOSED unless showArchived is on
  const threads = showArchived
    ? allThreads
    : allThreads.filter((thread: any) => !thread.status || thread.status === "OPEN");

  // Fetch thread detail
  const { data: threadDetail, mutate: mutateThread } = useSwrFetch<any>(selectedThreadId ? `/api/mail/threads/${selectedThreadId}` : null);
  const threadEmails = threadDetail?.emails || [];
  const threadInfo = threadDetail?.thread;

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/mail"), undefined, { revalidate: true });
  }, [mutate]);

  // Auto mark as read when opening a thread
  useEffect(() => {
    if (threadInfo && threadInfo.unread) {
      fetch(`/api/mail/threads/${threadInfo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead" }),
      }).then(() => {
        mutateThread();
        refreshData();
      });
    }
  }, [threadInfo?._id, threadInfo?.unread, mutateThread, refreshData]);

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setSheetOpen(true);
    setReplyText("");
  };

  const closeThread = () => {
    setSheetOpen(false);
    setSelectedThreadId(null);
    setReplyText("");
  };

  const handleThreadAction = async (action: string) => {
    if (!threadInfo) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/mail/threads/${threadInfo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        mutateThread();
        refreshData();
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  };

  const updateCompose = (field: string, value: string) => {
    setComposeForm((prev) => ({ ...prev, [field]: value }));
    if (composeErrors[field]) setComposeErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCompose = () => {
    const errors: Record<string, string> = {};
    if (!composeForm.to.trim()) errors.to = t("Alıcı gerekli", "Recipient is required");
    else if (!/\S+@\S+\.\S+/.test(composeForm.to)) errors.to = t("Geçerli bir e-posta gerekli", "Valid email is required");
    if (!composeForm.subject.trim()) errors.subject = t("Konu gerekli", "Subject is required");
    if (!composeForm.text.trim()) errors.text = t("Mesaj gerekli", "Message body is required");
    setComposeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleComposeSend = async () => {
    if (!validateCompose()) return;
    setComposeSending(true);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeForm.to.trim(),
          subject: composeForm.subject.trim(),
          text: composeForm.text,
          html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${composeForm.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("E-posta gönderilemedi", "Failed to send email"));
        return;
      }
      refreshData();
      setComposeOpen(false);
      setComposeForm({ to: "", subject: "", text: "" });
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setComposeSending(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !threadInfo) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: threadInfo.customerEmail,
          subject: `Re: ${threadInfo.subject}`,
          text: replyText,
          html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${replyText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
          threadId: threadInfo._id,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Yanıt gönderilemedi", "Failed to send reply"));
        return;
      }
      setReplyText("");
      mutateThread();
      refreshData();
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setReplySending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "ARCHIVED") return <Badge variant="default">{t("Arşiv", "Archived")}</Badge>;
    if (status === "CLOSED") return <Badge variant="error">{t("Kapalı", "Closed")}</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">{t("Posta Merkezi", "Mail Center")}</h2>
        <Button variant="primary" size="sm" onClick={() => { setComposeForm({ to: "", subject: "", text: "" }); setComposeErrors({}); setComposeOpen(true); }}>
          <Send size={16} className="mr-1" /> {t("Yeni Mesaj", "Compose")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            placeholder={t("Konuşmaları ara...", "Search threads...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-charcoal border border-slate rounded-sm pl-10 pr-4 py-3 text-sm text-brand-white placeholder:text-mist/50 focus:outline-none focus:border-brand-white transition-colors"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-mist cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-brand-gold"
          />
          {t("Arşivlenmişleri Göster", "Show Archived")}
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20">
          <Mail size={48} className="mx-auto text-mist mb-4" />
          <p className="text-mist">{t("E-posta konuşması bulunamadı", "No email threads found")}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {threads.map((thread: any) => (
            <div
              key={thread._id}
              className={cn(
                "flex items-center justify-between p-4 border border-slate/30 rounded-sm hover:bg-charcoal/50 transition-colors cursor-pointer",
                thread.unread && "border-l-2 border-l-brand-gold"
              )}
              onClick={() => openThread(thread._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.unread && (
                    <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                  )}
                  <p className={cn("text-sm truncate", thread.unread ? "font-semibold" : "font-medium")}>{thread.customerEmail}</p>
                  <span className="text-xs text-mist bg-charcoal px-2 py-0.5 rounded-full shrink-0">{thread.messageCount}</span>
                  {thread.status && getStatusBadge(thread.status)}
                </div>
                <p className={cn("text-xs truncate", thread.unread ? "text-brand-white/80" : "text-mist")}>{thread.subject}</p>
              </div>
              <span className="text-xs text-mist shrink-0 ml-4">{formatRelative(thread.lastMessageAt)}</span>
            </div>
          ))}
        </div>
      )}

      {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} title={t("E-posta Yaz", "Compose Email")} className="max-w-xl">
        <div className="space-y-4">
          <Input
            label={t("Kime", "To")}
            type="email"
            value={composeForm.to}
            onChange={(e) => updateCompose("to", e.target.value)}
            error={composeErrors.to}
            placeholder="alici@ornek.com"
          />
          <Input
            label={t("Konu", "Subject")}
            value={composeForm.subject}
            onChange={(e) => updateCompose("subject", e.target.value)}
            error={composeErrors.subject}
            placeholder={t("E-posta konusu", "Email subject")}
          />
          <Textarea
            label={t("Mesaj", "Message")}
            rows={8}
            value={composeForm.text}
            onChange={(e) => updateCompose("text", e.target.value)}
            error={composeErrors.text}
            placeholder={t("Mesajınızı yazın...", "Write your message...")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>{t("Vazgeç", "Cancel")}</Button>
            <Button variant="primary" size="sm" loading={composeSending} onClick={handleComposeSend}>
              <Send size={14} className="mr-1" /> {t("Gönder", "Send")}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Thread Detail Sheet */}
      <Sheet open={sheetOpen} onClose={closeThread} title={threadInfo?.subject || t("Konuşma", "Thread")}>
        {threadDetail ? (
          <div className="space-y-6 flex flex-col h-full">
            {/* Thread header */}
            <div className="space-y-1">
              <p className="text-sm font-medium">{threadInfo?.customerEmail}</p>
              <p className="text-xs text-mist">{threadInfo?.subject}</p>
              <p className="text-xs text-mist">{threadInfo?.messageCount} {t("mesaj", "message(s)")}</p>
            </div>

            {/* Thread actions */}
            <div className="flex gap-2 flex-wrap items-center">
              {threadInfo?.status === "OPEN" || !threadInfo?.status ? (
                <button
                  onClick={() => handleThreadAction("archive")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
                >
                  <Archive size={13} />
                  {t("Arşivle", "Archive")}
                </button>
              ) : (
                <button
                  onClick={() => handleThreadAction("reopen")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
                >
                  <ArchiveRestore size={13} />
                  {t("Yeniden Aç", "Reopen")}
                </button>
              )}

              {threadInfo?.status !== "CLOSED" && (
                <button
                  onClick={() => handleThreadAction("close")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
                >
                  <XCircle size={13} />
                  {t("Kapat", "Close")}
                </button>
              )}

              {threadInfo?.unread ? (
                <button
                  onClick={() => handleThreadAction("markRead")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
                >
                  <Eye size={13} />
                  {t("Okundu", "Mark Read")}
                </button>
              ) : (
                <button
                  onClick={() => handleThreadAction("markUnread")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
                >
                  <EyeOff size={13} />
                  {t("Okunmadı", "Mark Unread")}
                </button>
              )}

              {threadInfo?.status && getStatusBadge(threadInfo.status)}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {threadEmails.length === 0 ? (
                <p className="text-sm text-mist text-center py-8">{t("Bu konuşmada mesaj yok", "No messages in this thread")}</p>
              ) : (
                threadEmails.map((email: any) => (
                  <div
                    key={email._id}
                    className={cn(
                      "p-4 rounded-sm border",
                      email.direction === "OUTBOUND"
                        ? "border-brand-gold/20 bg-brand-gold/5 ml-4"
                        : "border-slate bg-charcoal mr-4"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-mist" />
                        <span className="text-xs font-medium">
                          {email.direction === "OUTBOUND" ? email.from : email.from || threadInfo?.customerEmail}
                        </span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          email.direction === "OUTBOUND" ? "bg-brand-gold/20 text-brand-gold" : "bg-blue-500/20 text-blue-400"
                        )}>
                          {email.direction === "OUTBOUND" ? t("Gönderildi", "Sent") : t("Alındı", "Received")}
                        </span>
                      </div>
                      <span className="text-xs text-mist">{formatDateTime(email.sentAt || email.receivedAt)}</span>
                    </div>
                    {email.subject && <p className="text-xs text-mist mb-2">{email.subject}</p>}
                    <div className="text-sm text-brand-white/80 whitespace-pre-wrap">
                      {email.text || (email.html ? <div dangerouslySetInnerHTML={{ __html: email.html }} /> : t("İçerik yok", "No content"))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply box */}
            <div className="pt-4 border-t border-slate space-y-3">
              <Textarea
                placeholder={t("Yanıtınızı yazın...", "Type your reply...")}
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" loading={replySending} onClick={handleReply} disabled={!replyText.trim()}>
                  <Reply size={14} className="mr-1" /> {t("Yanıtla", "Reply")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40" />
          </div>
        )}
      </Sheet>
    </div>
  );
}
