"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";

interface CalendarEvent {
  _id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  type: string;
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarView({ events = [], onDateClick, onEventClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [currentMonth]);

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => isSameDay(new Date(e.start), date));
  };

  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 text-mist hover:text-brand-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-serif text-xl">
          {format(currentMonth, "MMMM yyyy", { locale: tr })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 text-mist hover:text-brand-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium tracking-wider uppercase text-mist py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-slate">
        {weeks.flat().map((day, i) => {
          const dayEvents = getEventsForDate(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={i}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-slate p-2 cursor-pointer transition-colors",
                inMonth ? "bg-brand-black" : "bg-brand-black/50",
                today && "bg-charcoal",
                "hover:bg-charcoal/70"
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  !inMonth && "text-mist/30",
                  today && "text-brand-gold font-bold"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((evt) => (
                  <button
                    key={evt._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(evt);
                    }}
                    className={cn(
                      "block w-full text-left text-[10px] truncate px-1 py-0.5 rounded-sm",
                      evt.type === "BLOCKED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-brand-gold/20 text-brand-gold"
                    )}
                  >
                    {evt.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-mist">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
