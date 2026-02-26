"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { formatRelative, formatDateTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Mail, Send, Search, Reply, User } from "lucide-react";

export default function MailPage() {
  const { mutate } = useSWRConfig();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

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

  const { data, isLoading } = useSwrPaginated("/api/mail", { page, limit: 20, search: search || undefined });
  const threads = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  // Fetch thread detail
  const { data: threadDetail } = useSwrFetch<any>(selectedThreadId ? `/api/mail/threads/${selectedThreadId}` : null);
  const threadEmails = threadDetail?.emails || [];
  const threadInfo = threadDetail?.thread;

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/mail"), undefined, { revalidate: true });
  }, [mutate]);

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

  const updateCompose = (field: string, value: string) => {
    setComposeForm((prev) => ({ ...prev, [field]: value }));
    if (composeErrors[field]) setComposeErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCompose = () => {
    const errors: Record<string, string> = {};
    if (!composeForm.to.trim()) errors.to = "Recipient is required";
    else if (!/\S+@\S+\.\S+/.test(composeForm.to)) errors.to = "Valid email is required";
    if (!composeForm.subject.trim()) errors.subject = "Subject is required";
    if (!composeForm.text.trim()) errors.text = "Message body is required";
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
        alert(err.error || "Failed to send email");
        return;
      }
      refreshData();
      setComposeOpen(false);
      setComposeForm({ to: "", subject: "", text: "" });
    } catch {
      alert("Network error");
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
        alert(err.error || "Failed to send reply");
        return;
      }
      setReplyText("");
      mutate(`/api/mail/threads/${selectedThreadId}`);
      refreshData();
    } catch {
      alert("Network error");
    } finally {
      setReplySending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Mail Center</h2>
        <Button variant="primary" size="sm" onClick={() => { setComposeForm({ to: "", subject: "", text: "" }); setComposeErrors({}); setComposeOpen(true); }}>
          <Send size={16} className="mr-1" /> Compose
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
        <input
          placeholder="Search threads..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-charcoal border border-slate rounded-sm pl-10 pr-4 py-3 text-sm text-brand-white placeholder:text-mist/50 focus:outline-none focus:border-brand-white transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20">
          <Mail size={48} className="mx-auto text-mist mb-4" />
          <p className="text-mist">No email threads found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {threads.map((thread: any) => (
            <div
              key={thread._id}
              className="flex items-center justify-between p-4 border border-slate/30 rounded-sm hover:bg-charcoal/50 transition-colors cursor-pointer"
              onClick={() => openThread(thread._id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{thread.customerEmail}</p>
                  <span className="text-xs text-mist bg-charcoal px-2 py-0.5 rounded-full shrink-0">{thread.messageCount}</span>
                </div>
                <p className="text-xs text-mist truncate">{thread.subject}</p>
              </div>
              <span className="text-xs text-mist shrink-0 ml-4">{formatRelative(thread.lastMessageAt)}</span>
            </div>
          ))}
        </div>
      )}

      {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} title="Compose Email" className="max-w-xl">
        <div className="space-y-4">
          <Input
            label="To"
            type="email"
            value={composeForm.to}
            onChange={(e) => updateCompose("to", e.target.value)}
            error={composeErrors.to}
            placeholder="recipient@example.com"
          />
          <Input
            label="Subject"
            value={composeForm.subject}
            onChange={(e) => updateCompose("subject", e.target.value)}
            error={composeErrors.subject}
            placeholder="Email subject"
          />
          <Textarea
            label="Message"
            rows={8}
            value={composeForm.text}
            onChange={(e) => updateCompose("text", e.target.value)}
            error={composeErrors.text}
            placeholder="Write your message..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={composeSending} onClick={handleComposeSend}>
              <Send size={14} className="mr-1" /> Send
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Thread Detail Sheet */}
      <Sheet open={sheetOpen} onClose={closeThread} title={threadInfo?.subject || "Thread"}>
        {threadDetail ? (
          <div className="space-y-6 flex flex-col h-full">
            {/* Thread header */}
            <div className="space-y-1">
              <p className="text-sm font-medium">{threadInfo?.customerEmail}</p>
              <p className="text-xs text-mist">{threadInfo?.subject}</p>
              <p className="text-xs text-mist">{threadInfo?.messageCount} message(s)</p>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {threadEmails.length === 0 ? (
                <p className="text-sm text-mist text-center py-8">No messages in this thread</p>
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
                          {email.direction === "OUTBOUND" ? "Sent" : "Received"}
                        </span>
                      </div>
                      <span className="text-xs text-mist">{formatDateTime(email.sentAt || email.receivedAt)}</span>
                    </div>
                    {email.subject && <p className="text-xs text-mist mb-2">{email.subject}</p>}
                    <div className="text-sm text-brand-white/80 whitespace-pre-wrap">
                      {email.text || (email.html ? <div dangerouslySetInnerHTML={{ __html: email.html }} /> : "No content")}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply box */}
            <div className="pt-4 border-t border-slate space-y-3">
              <Textarea
                placeholder="Type your reply..."
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" loading={replySending} onClick={handleReply} disabled={!replyText.trim()}>
                  <Reply size={14} className="mr-1" /> Reply
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
