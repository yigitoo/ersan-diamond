"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import {
  Mail, Send, Search, Reply, User, Archive, ArchiveRestore,
  Eye, EyeOff, XCircle, Inbox, PenSquare,
} from "lucide-react";
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

  // Thread detail — used for both inline (desktop) and sheet (mobile)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  // Scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when messages load
  useEffect(() => {
    if (threadEmails.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadEmails.length]);

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setReplyText("");
    // On mobile/tablet, open sheet. On desktop, inline selection handles it.
    setMobileSheetOpen(true);
  };

  const closeThread = () => {
    setMobileSheetOpen(false);
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

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getSnippet = (thread: any) => {
    if (thread.lastMessageSnippet) return thread.lastMessageSnippet;
    return "";
  };

  /* --------------------------------- Thread Actions Bar --------------------------------- */
  const ThreadActions = () => {
    if (!threadInfo) return null;
    return (
      <div className="flex gap-1.5 flex-wrap items-center">
        {threadInfo.status === "OPEN" || !threadInfo.status ? (
          <button
            onClick={() => handleThreadAction("archive")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
          >
            <Archive size={13} />
            {t("Arşivle", "Archive")}
          </button>
        ) : (
          <button
            onClick={() => handleThreadAction("reopen")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
          >
            <ArchiveRestore size={13} />
            {t("Yeniden Aç", "Reopen")}
          </button>
        )}

        {threadInfo.status !== "CLOSED" && (
          <button
            onClick={() => handleThreadAction("close")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
          >
            <XCircle size={13} />
            {t("Kapat", "Close")}
          </button>
        )}

        {threadInfo.unread ? (
          <button
            onClick={() => handleThreadAction("markRead")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
          >
            <Eye size={13} />
            {t("Okundu", "Mark Read")}
          </button>
        ) : (
          <button
            onClick={() => handleThreadAction("markUnread")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors disabled:opacity-50"
          >
            <EyeOff size={13} />
            {t("Okunmadı", "Mark Unread")}
          </button>
        )}

        {threadInfo.status && getStatusBadge(threadInfo.status)}
      </div>
    );
  };

  /* --------------------------------- Messages List --------------------------------- */
  const MessagesList = () => (
    <div className="flex-1 space-y-4 overflow-y-auto">
      {threadEmails.length === 0 ? (
        <p className="text-sm text-mist text-center py-8">{t("Bu konuşmada mesaj yok", "No messages in this thread")}</p>
      ) : (
        threadEmails.map((email: any) => {
          const isOutbound = email.direction === "OUTBOUND";
          const senderEmail = isOutbound ? email.from : (email.from || threadInfo?.customerEmail);
          return (
            <div
              key={email._id}
              className={cn(
                "flex gap-3",
                isOutbound ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                isOutbound ? "bg-brand-gold/20 text-brand-gold" : "bg-slate text-mist"
              )}>
                {getInitials(senderEmail || "?")}
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  "flex-1 max-w-[85%] p-3 sm:p-4 rounded-sm border",
                  isOutbound
                    ? "border-brand-gold/20 bg-brand-gold/5"
                    : "border-slate bg-charcoal"
                )}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-medium truncate">{senderEmail}</span>
                  <span className="text-[10px] text-mist shrink-0">{formatDateTime(email.sentAt || email.receivedAt)}</span>
                </div>
                {email.subject && <p className="text-[10px] text-mist mb-2">{email.subject}</p>}
                <div className="text-sm text-brand-white/80 whitespace-pre-wrap break-words">
                  {email.text || (email.html ? <div dangerouslySetInnerHTML={{ __html: email.html }} /> : t("İçerik yok", "No content"))}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  /* --------------------------------- Reply Box --------------------------------- */
  const ReplyBox = () => (
    <div className="border-t border-slate p-3 sm:p-4 space-y-3 shrink-0">
      <Textarea
        placeholder={t("Yanıtınızı yazın...", "Type your reply...")}
        rows={3}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />
      <div className="flex justify-end">
        <Button variant="primary" size="sm" loading={replySending} onClick={handleReply} disabled={!replyText.trim()}>
          <Send size={14} className="mr-1" /> {t("Gönder", "Send")}
        </Button>
      </div>
    </div>
  );

  /* --------------------------------- Thread Detail Panel (inline desktop) --------------------------------- */
  const ThreadDetailContent = () => {
    if (!threadDetail) {
      return (
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40" />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Sticky header */}
        <div className="border-b border-slate p-4 space-y-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-lg truncate">{threadInfo?.subject}</h3>
              <p className="text-sm text-mist mt-0.5">{threadInfo?.customerEmail}</p>
              <p className="text-xs text-mist mt-0.5">{threadInfo?.messageCount} {t("mesaj", "message(s)")}</p>
            </div>
          </div>
          <ThreadActions />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessagesList />
        </div>

        {/* Reply */}
        <ReplyBox />
      </div>
    );
  };

  /* --------------------------------- Thread List Item --------------------------------- */
  const ThreadItem = ({ thread }: { thread: any }) => {
    const isActive = selectedThreadId === thread._id;
    const snippet = getSnippet(thread);

    return (
      <div
        className={cn(
          "relative flex items-start gap-3 p-3 sm:p-4 border-b border-slate/20 hover:bg-charcoal/50 transition-colors cursor-pointer group",
          thread.unread && "border-l-2 border-l-brand-gold",
          isActive && "bg-charcoal/50"
        )}
        onClick={() => openThread(thread._id)}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate flex items-center justify-center text-xs font-medium text-brand-white shrink-0">
          {getInitials(thread.customerEmail || "?")}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              {thread.unread && (
                <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
              )}
              <p className={cn("text-sm truncate", thread.unread ? "font-semibold text-brand-white" : "font-medium text-brand-white/80")}>
                {thread.customerEmail}
              </p>
            </div>
            <span className="text-[10px] text-mist shrink-0">{formatRelative(thread.lastMessageAt)}</span>
          </div>

          <p className={cn("text-xs truncate", thread.unread ? "text-brand-white/80 font-medium" : "text-mist")}>
            {thread.subject}
          </p>

          {snippet && (
            <p className="text-xs text-mist/60 truncate mt-0.5">{snippet}</p>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-mist bg-charcoal px-1.5 py-0.5 rounded-full">
              {thread.messageCount}
            </span>
            {thread.status && getStatusBadge(thread.status)}
          </div>
        </div>

        {/* Hover actions (desktop only) */}
        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedThreadId(thread._id);
              // Inline action
              fetch(`/api/mail/threads/${thread._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: thread.status === "ARCHIVED" ? "reopen" : "archive" }),
              }).then(() => refreshData());
            }}
            className="p-1.5 text-mist hover:text-brand-white transition-colors rounded-sm hover:bg-slate"
            title={thread.status === "ARCHIVED" ? t("Yeniden Aç", "Reopen") : t("Arşivle", "Archive")}
          >
            {thread.status === "ARCHIVED" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetch(`/api/mail/threads/${thread._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: thread.unread ? "markRead" : "markUnread" }),
              }).then(() => refreshData());
            }}
            className="p-1.5 text-mist hover:text-brand-white transition-colors rounded-sm hover:bg-slate"
            title={thread.unread ? t("Okundu İşaretle", "Mark Read") : t("Okunmadı İşaretle", "Mark Unread")}
          >
            {thread.unread ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
      </div>
    );
  };

  /* ================================= RENDER ================================= */

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Posta Merkezi", "Mail Center")}</h2>
        <Button variant="primary" size="sm" onClick={() => { setComposeForm({ to: "", subject: "", text: "" }); setComposeErrors({}); setComposeOpen(true); }}>
          <PenSquare size={16} className="mr-1" /> {t("Yeni Mesaj", "Compose")}
        </Button>
      </div>

      {/* Split-pane container on desktop, full-width list on mobile */}
      <div className="flex border border-slate/30 rounded-sm overflow-hidden bg-brand-black" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {/* ---- Thread list panel ---- */}
        <div className={cn(
          "flex flex-col border-r border-slate/30 shrink-0",
          selectedThreadId ? "hidden lg:flex w-[400px] xl:w-[440px]" : "w-full lg:w-[400px] xl:w-[440px]"
        )}>
          {/* Search bar */}
          <div className="p-3 border-b border-slate/30">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
              <input
                placeholder={t("Konuşmaları ara...", "Search threads...")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-charcoal border border-slate rounded-sm pl-10 pr-4 py-2.5 text-sm text-brand-white placeholder:text-mist/50 focus:outline-none focus:border-brand-white/40 transition-colors"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-mist cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="accent-brand-gold"
                />
                {t("Arşivlenmişler", "Show Archived")}
              </label>
              {meta && (
                <span className="text-[10px] text-mist">{meta.total} {t("konuşma", "threads")}</span>
              )}
            </div>
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-mist">
                <Inbox size={40} className="mb-3 opacity-50" />
                <p className="text-sm">{t("E-posta konuşması bulunamadı", "No email threads found")}</p>
              </div>
            ) : (
              <>
                {threads.map((thread: any) => (
                  <ThreadItem key={thread._id} thread={thread} />
                ))}
                {meta && meta.totalPages > 1 && (
                  <div className="p-3">
                    <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ---- Thread detail panel (desktop inline) ---- */}
        <div className="hidden lg:flex flex-col flex-1">
          {selectedThreadId ? (
            <ThreadDetailContent />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-mist">
              <Mail size={48} className="mb-4 opacity-30" />
              <p className="text-sm">{t("Bir konuşma seçin", "Select a thread to read")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Thread detail sheet (mobile/tablet) ---- */}
      <Sheet
        open={mobileSheetOpen && !!selectedThreadId}
        onClose={closeThread}
        title={threadInfo?.subject || t("Konuşma", "Thread")}
        className="lg:hidden"
      >
        {threadDetail ? (
          <div className="space-y-4 flex flex-col h-full">
            {/* Header info */}
            <div className="space-y-1">
              <p className="text-sm font-medium">{threadInfo?.customerEmail}</p>
              <p className="text-xs text-mist">{threadInfo?.messageCount} {t("mesaj", "message(s)")}</p>
            </div>

            <ThreadActions />

            <div className="flex-1 overflow-y-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <MessagesList />
            </div>

            <div className="space-y-3 pt-3 border-t border-slate">
              <Textarea
                placeholder={t("Yanıtınızı yazın...", "Type your reply...")}
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" loading={replySending} onClick={handleReply} disabled={!replyText.trim()}>
                  <Send size={14} className="mr-1" /> {t("Gönder", "Send")}
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
    </div>
  );
}
