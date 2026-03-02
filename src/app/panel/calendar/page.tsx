"use client";

import { useState, useMemo, useCallback } from "react";
import { useSwrFetch } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, MapPin, FileText, User, Tag } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "\u00c7ar", "Per", "Cum", "Cmt"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_TYPE_COLORS: Record<string, string> = {
  APPOINTMENT: "bg-brand-gold/20 text-brand-gold border-brand-gold/30",
  PERSONAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  BLOCKED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const EVENT_TYPE_BADGE_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  APPOINTMENT: "warning",
  PERSONAL: "info",
  BLOCKED: "error",
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { t, locale } = useI18n();
  const { data: session } = useSession();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startStr = monthStart.toISOString();
  const endStr = monthEnd.toISOString();

  const { data: events, isLoading, mutate } = useSwrFetch<any[]>(`/api/calendar?start=${startStr}&end=${endStr}`);

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    (events || []).forEach((event: any) => {
      const dayKey = format(new Date(event.start), "yyyy-MM-dd");
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(event);
    });
    return map;
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dayKey = format(selectedDay, "yyyy-MM-dd");
    return eventsByDay[dayKey] || [];
  }, [selectedDay, eventsByDay]);

  // Pad the start of the month to align with the correct day of the week
  const startDayOfWeek = monthStart.getDay(); // 0=Sun
  const paddedDays = Array.from({ length: startDayOfWeek }, () => null);

  const dayNames = locale === "tr" ? DAY_NAMES_TR : DAY_NAMES_EN;

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    setDeleting(eventId);
    try {
      const res = await fetch(`/api/calendar?id=${eventId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        mutate();
        // Close detail sheet if the deleted event was being viewed
        if (detailEvent?._id === eventId) {
          setDetailEvent(null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  }, [mutate, detailEvent]);

  const handleAddSuccess = useCallback(() => {
    setAddDialogOpen(false);
    mutate();
  }, [mutate]);

  const formatTimeRange = (start: string, end: string) => {
    return `${format(new Date(start), "HH:mm")} - ${format(new Date(end), "HH:mm")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Takvim", "Calendar")}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            {t("Etkinlik Ekle", "Add Event")}
          </Button>
          <div className="flex items-center gap-2 justify-center">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-mist hover:text-brand-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium min-w-32 text-center">
              {locale === "tr"
                ? format(currentMonth, "MMMM yyyy", { locale: tr })
                : format(currentMonth, "MMMM yyyy")}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-mist hover:text-brand-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-[10px] md:text-xs text-mist py-1 md:py-2 font-medium">{day}</div>
        ))}

        {/* Padding */}
        {paddedDays.map((_, i) => <div key={`pad-${i}`} />)}

        {/* Days */}
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[dayKey] || [];
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <div
              key={dayKey}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "min-h-10 md:min-h-24 border border-slate/30 rounded-sm p-1 md:p-2 cursor-pointer transition-colors",
                isToday(day) && "border-brand-gold/50 bg-brand-gold/5",
                isSelected && "border-brand-white/60 bg-brand-white/5",
                !isSameMonth(day, currentMonth) && "opacity-30"
              )}
            >
              <span className={cn("text-[10px] md:text-xs", isToday(day) ? "text-brand-gold font-bold" : "text-mist")}>{format(day, "d")}</span>
              {/* Mobile: dots only */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 md:hidden flex-wrap">
                  {dayEvents.slice(0, 4).map((event: any, i: number) => {
                    const dotColor = event.type === "APPOINTMENT" ? "bg-brand-gold" : event.type === "BLOCKED" ? "bg-red-400" : "bg-blue-400";
                    return <div key={event._id || i} className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />;
                  })}
                </div>
              )}
              {/* Desktop: text labels */}
              <div className="mt-1 space-y-0.5 hidden md:block">
                {dayEvents.slice(0, 3).map((event: any, i: number) => (
                  <div
                    key={event._id || i}
                    onClick={(e) => { e.stopPropagation(); setDetailEvent(event); }}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity",
                      EVENT_TYPE_COLORS[event.type] || "bg-charcoal text-soft-white"
                    )}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <p className="text-xs text-mist">+{dayEvents.length - 3} {t("daha", "more")}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day events list */}
      {selectedDay && (
        <div className="border border-slate/30 rounded-sm p-3 md:p-4 space-y-3">
          <h3 className="font-serif text-lg text-brand-white">
            {locale === "tr"
              ? format(selectedDay, "d MMMM yyyy, EEEE", { locale: tr })
              : format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h3>
          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-mist">{t("Bu g\u00fcn i\u00e7in etkinlik yok", "No events for this day")}</p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((event: any) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between gap-3 p-3 rounded bg-charcoal/50 border border-slate/20 hover:border-slate/40 transition-colors cursor-pointer"
                  onClick={() => setDetailEvent(event)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-mist shrink-0">
                      <Clock size={14} />
                      {formatTimeRange(event.start, event.end)}
                    </div>
                    <span className="text-sm text-brand-white truncate">{event.title}</span>
                    <Badge variant={EVENT_TYPE_BADGE_VARIANT[event.type] || "default"}>
                      {event.type}
                    </Badge>
                  </div>
                  {(event.type === "PERSONAL" || event.type === "BLOCKED") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event._id); }}
                      disabled={deleting === event._id}
                      className="text-red-400 hover:text-red-300 transition-colors shrink-0 p-1 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Event Dialog */}
      <AddEventDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
        userId={(session?.user as any)?.id}
        t={t}
      />

      {/* Event Detail Sheet */}
      <Sheet
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        title={detailEvent?.title || t("Etkinlik Detay\u0131", "Event Detail")}
        side="right"
      >
        {detailEvent && (
          <EventDetail
            event={detailEvent}
            onDelete={handleDeleteEvent}
            deleting={deleting}
            t={t}
            locale={locale}
          />
        )}
      </Sheet>
    </div>
  );
}

/* -------------------------------------------------- */
/* Add Event Dialog                                    */
/* -------------------------------------------------- */

function AddEventDialog({
  open,
  onClose,
  onSuccess,
  userId,
  t,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
  t: (tr: string, en: string) => string;
}) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("PERSONAL");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setType("PERSONAL");
    setNotes("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      setError(t("T\u00fcm zorunlu alanlar\u0131 doldurun", "Fill in all required fields"));
      return;
    }
    if (!userId) {
      setError(t("Oturum bulunamad\u0131", "Session not found"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerUserId: userId,
          title,
          start: new Date(startDate).toISOString(),
          end: new Date(endDate).toISOString(),
          type,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        reset();
        onSuccess();
      } else {
        setError(json.error || t("Etkinlik olu\u015fturulamad\u0131", "Failed to create event"));
      }
    } catch (err) {
      setError(t("Bir hata olu\u015ftu", "An error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={t("Etkinlik Ekle", "Add Event")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("Ba\u015fl\u0131k", "Title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("Etkinlik ba\u015fl\u0131\u011f\u0131", "Event title")}
          required
        />

        <Input
          label={t("Ba\u015flang\u0131\u00e7", "Start")}
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <Input
          label={t("Biti\u015f", "End")}
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        <Select
          label={t("T\u00fcr", "Type")}
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: "PERSONAL", label: t("Ki\u015fisel", "Personal") },
            { value: "BLOCKED", label: t("Bloke", "Blocked") },
          ]}
        />

        <Textarea
          label={t("Notlar", "Notes")}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("Opsiyonel notlar...", "Optional notes...")}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t("\u0130ptal", "Cancel")}
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={submitting}>
            {t("Olu\u015ftur", "Create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/* -------------------------------------------------- */
/* Event Detail (Sheet content)                        */
/* -------------------------------------------------- */

function EventDetail({
  event,
  onDelete,
  deleting,
  t,
  locale,
}: {
  event: any;
  onDelete: (id: string) => void;
  deleting: string | null;
  t: (tr: string, en: string) => string;
  locale: string;
}) {
  const canDelete = event.type === "PERSONAL" || event.type === "BLOCKED";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return locale === "tr"
      ? format(d, "d MMMM yyyy HH:mm", { locale: tr })
      : format(d, "MMMM d, yyyy HH:mm");
  };

  return (
    <div className="space-y-5">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <Tag size={14} className="text-mist" />
        <Badge variant={EVENT_TYPE_BADGE_VARIANT[event.type] || "default"}>
          {event.type === "APPOINTMENT" ? t("Randevu", "Appointment")
            : event.type === "PERSONAL" ? t("Ki\u015fisel", "Personal")
            : t("Bloke", "Blocked")}
        </Badge>
      </div>

      {/* Time range */}
      <div className="flex items-start gap-2">
        <Clock size={14} className="text-mist mt-0.5" />
        <div className="text-sm">
          <p className="text-brand-white">{formatDate(event.start)}</p>
          <p className="text-mist">{formatDate(event.end)}</p>
        </div>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-mist" />
          <span className="text-sm text-brand-white">{event.location}</span>
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <div className="flex items-start gap-2">
          <FileText size={14} className="text-mist mt-0.5" />
          <p className="text-sm text-soft-white whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}

      {/* Appointment details (populated) */}
      {event.type === "APPOINTMENT" && event.appointmentId && typeof event.appointmentId === "object" && (
        <div className="border border-slate/30 rounded-sm p-3 space-y-2">
          <h4 className="text-xs font-medium tracking-wider uppercase text-mist">
            {t("Randevu Bilgileri", "Appointment Info")}
          </h4>
          {event.appointmentId.customerName && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-mist" />
              <span className="text-sm text-brand-white">{event.appointmentId.customerName}</span>
            </div>
          )}
          {event.appointmentId.serviceType && (
            <div className="text-sm text-soft-white">
              <span className="text-mist">{t("Hizmet:", "Service:")}</span> {event.appointmentId.serviceType}
            </div>
          )}
          {event.appointmentId.status && (
            <div className="text-sm">
              <span className="text-mist">{t("Durum:", "Status:")}</span>{" "}
              <Badge variant={event.appointmentId.status === "CONFIRMED" ? "success" : event.appointmentId.status === "CANCELLED" ? "error" : "default"}>
                {event.appointmentId.status}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Delete button */}
      {canDelete && (
        <div className="pt-3 border-t border-slate/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(event._id)}
            loading={deleting === event._id}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 size={16} className="mr-1.5" />
            {t("Etkinli\u011fi Sil", "Delete Event")}
          </Button>
        </div>
      )}
    </div>
  );
}
