"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Send } from "lucide-react";

const TEMPLATE_OPTIONS = [
  { value: "", label: "Şablon seçin (opsiyonel)" },
  { value: "appointment-confirmed", label: "Randevu Onayı" },
  { value: "appointment-cancelled", label: "Randevu İptali" },
  { value: "appointment-rescheduled", label: "Randevu Değişikliği" },
  { value: "reminder-24h", label: "Hatırlatma (24 saat)" },
  { value: "reminder-2h", label: "Hatırlatma (2 saat)" },
  { value: "inventory-inquiry", label: "Ürün Talebi Cevabı" },
  { value: "sell-to-us-reply", label: "Satış Talebi Cevabı" },
];

interface MailComposerProps {
  defaultTo?: string;
  defaultSubject?: string;
  onSend?: (data: { to: string; subject: string; text: string; templateId?: string }) => void;
  loading?: boolean;
}

export function MailComposer({ defaultTo = "", defaultSubject = "", onSend, loading }: MailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [text, setText] = useState("");
  const [templateId, setTemplateId] = useState("");

  const handleSend = () => {
    if (!to || !subject) return;
    onSend?.({ to, subject, text, templateId: templateId || undefined });
  };

  return (
    <div className="space-y-4 border-t border-slate pt-4">
      <Input
        label="Kime"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="email@example.com"
      />
      <Input
        label="Konu"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Konu..."
      />
      <Select
        label="Şablon"
        options={TEMPLATE_OPTIONS}
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      />
      <Textarea
        label="Mesaj"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mesajınızı yazın..."
        rows={6}
      />
      <div className="flex justify-end">
        <Button onClick={handleSend} loading={loading} disabled={!to || !subject}>
          <Send size={14} className="mr-2" />
          Gönder
        </Button>
      </div>
    </div>
  );
}
