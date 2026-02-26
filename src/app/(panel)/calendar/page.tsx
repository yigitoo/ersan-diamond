"use client";

import { useState, useMemo } from "react";
import { useSwrFetch } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startStr = monthStart.toISOString();
  const endStr = monthEnd.toISOString();

  const { data: events, isLoading } = useSwrFetch<any[]>(`/api/calendar?start=${startStr}&end=${endStr}`);

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    (events || []).forEach((event: any) => {
      const dayKey = format(new Date(event.start), "yyyy-MM-dd");
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(event);
    });
    return map;
  }, [events]);

  // Pad the start of the month to align with the correct day of the week
  const startDayOfWeek = monthStart.getDay(); // 0=Sun
  const paddedDays = Array.from({ length: startDayOfWeek }, () => null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-mist hover:text-brand-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-32 text-center">{format(currentMonth, "MMMM yyyy", { locale: tr })}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-mist hover:text-brand-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs text-mist py-2 font-medium">{day}</div>
        ))}

        {/* Padding */}
        {paddedDays.map((_, i) => <div key={`pad-${i}`} />)}

        {/* Days */}
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[dayKey] || [];
          return (
            <div
              key={dayKey}
              className={cn(
                "min-h-24 border border-slate/30 rounded-sm p-2",
                isToday(day) && "border-brand-gold/50 bg-brand-gold/5",
                !isSameMonth(day, currentMonth) && "opacity-30"
              )}
            >
              <span className={cn("text-xs", isToday(day) ? "text-brand-gold font-bold" : "text-mist")}>{format(day, "d")}</span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event: any, i: number) => (
                  <div key={i} className="text-xs px-1 py-0.5 rounded bg-charcoal text-soft-white truncate">
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <p className="text-xs text-mist">+{dayEvents.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
