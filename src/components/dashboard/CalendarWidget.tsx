"use client";

import { useState } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, isSameMonth, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import styles from "./calendar.module.css";

interface CalendarWidgetProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  periodLogs: any[];
}

export default function CalendarWidget({ selectedDate, onSelectDate, periodLogs }: CalendarWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  // Determine if a date has a period log
  const hasPeriod = (date: Date) => {
    return periodLogs.some((log) => isSameDay(new Date(log.date), date));
  };

  // Generate week view days (centered around selectedDate or start of week)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Generate month view days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
  
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className={styles.calendarWidget}>
      <div className={styles.calendarHeader}>
        <h3 className={styles.monthTitle}>
          {format(expanded ? currentMonth : selectedDate, "MMMM yyyy")}
        </h3>
        <button 
          className={styles.expandButton} 
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse calendar" : "Expand calendar"}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className={styles.monthControls}>
          <button className={styles.iconButton} onClick={prevMonth}><ChevronLeft size={20} /></button>
          <span className={styles.currentMonthLabel}>{format(currentMonth, "MMM yyyy")}</span>
          <button className={styles.iconButton} onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      )}

      <div className={styles.daysGrid}>
        {/* Day headers */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {(expanded ? monthDays : weekDays).map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasFlow = hasPeriod(day);

          return (
            <button
              key={i}
              onClick={() => {
                onSelectDate(day);
                if (!isSameMonth(day, currentMonth)) {
                  setCurrentMonth(startOfMonth(day));
                }
              }}
              className={`${styles.dayCell} ${isSelected ? styles.selected : ""} ${
                !isCurrentMonth && expanded ? styles.dimmed : ""
              } ${isToday && !isSelected ? styles.today : ""}`}
            >
              <span className={styles.dayNumber}>{format(day, "d")}</span>
              {hasFlow && (
                <div className={styles.periodIndicator}>
                  <Droplets size={10} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
