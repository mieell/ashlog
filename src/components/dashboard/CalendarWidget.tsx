"use client";

import { useState, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  differenceInCalendarDays,
} from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Droplets,
} from "lucide-react";
import styles from "./calendar.module.css";

interface CalendarWidgetProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  periodLogs: any[];
  onTogglePeriodDay: (date: Date) => void;
}

/** Group period logs into contiguous ranges for display */
function getPeriodRanges(logs: any[]): { start: Date; end: Date; days: number }[] {
  if (!logs || logs.length === 0) return [];

  const dates = logs
    .map((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .sort((a, b) => a.getTime() - b.getTime());

  // Deduplicate
  const unique: Date[] = [];
  for (const d of dates) {
    if (unique.length === 0 || !isSameDay(unique[unique.length - 1], d)) {
      unique.push(d);
    }
  }

  const ranges: { start: Date; end: Date; days: number }[] = [];
  let rangeStart = unique[0];
  let prev = unique[0];

  for (let i = 1; i < unique.length; i++) {
    const diff = differenceInCalendarDays(unique[i], prev);
    if (diff > 1) {
      // Gap — close current range, start new one
      ranges.push({
        start: rangeStart,
        end: prev,
        days: differenceInCalendarDays(prev, rangeStart) + 1,
      });
      rangeStart = unique[i];
    }
    prev = unique[i];
  }
  // Close final range
  ranges.push({
    start: rangeStart,
    end: prev,
    days: differenceInCalendarDays(prev, rangeStart) + 1,
  });

  return ranges;
}

export default function CalendarWidget({
  selectedDate,
  onSelectDate,
  periodLogs,
  onTogglePeriodDay,
}: CalendarWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  // Period date set for O(1) lookup
  const periodDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const log of periodLogs) {
      const d = new Date(log.date);
      set.add(format(d, "yyyy-MM-dd"));
    }
    return set;
  }, [periodLogs]);

  // Period ranges for duration display
  const periodRanges = useMemo(() => getPeriodRanges(periodLogs), [periodLogs]);

  // Most recent period range
  const latestRange = periodRanges.length > 0 ? periodRanges[periodRanges.length - 1] : null;

  const hasPeriod = (date: Date) => periodDateSet.has(format(date, "yyyy-MM-dd"));

  // Check neighbors for range styling
  const hasPeriodPrev = (date: Date) => {
    const prev = addDays(date, -1);
    return periodDateSet.has(format(prev, "yyyy-MM-dd"));
  };
  const hasPeriodNext = (date: Date) => {
    const next = addDays(date, 1);
    return periodDateSet.has(format(next, "yyyy-MM-dd"));
  };

  // Week view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const mStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const mEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);
  const monthDays = eachDayOfInterval({ start: mStart, end: mEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className={styles.calendarWidget}>
      {/* Header */}
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

      {/* Month navigation (expanded only) */}
      {expanded && (
        <div className={styles.monthControls}>
          <button className={styles.iconButton} onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.currentMonthLabel}>
            {format(currentMonth, "MMM yyyy")}
          </span>
          <button className={styles.iconButton} onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Period duration summary */}
      {latestRange && (
        <div className={styles.periodSummary}>
          <Droplets size={14} />
          <span>
            Last period: <strong>{latestRange.days} day{latestRange.days !== 1 ? "s" : ""}</strong>
            {" "}({format(latestRange.start, "MMM d")}
            {latestRange.days > 1 ? ` – ${format(latestRange.end, "MMM d")}` : ""})
          </span>
        </div>
      )}

      {/* Tap hint */}
      <div className={styles.tapHint}>
        Tap a date to select · Long-press or double-tap to mark period day
      </div>

      {/* Days grid */}
      <div className={styles.daysGrid}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {(expanded ? monthDays : weekDays).map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPeriod = hasPeriod(day);
          const prevPeriod = hasPeriodPrev(day);
          const nextPeriod = hasPeriodNext(day);

          // Build class list
          let cellClass = styles.dayCell;
          if (isSelected) cellClass += ` ${styles.selected}`;
          if (!isCurrentMonth && expanded) cellClass += ` ${styles.dimmed}`;
          if (isToday && !isSelected) cellClass += ` ${styles.today}`;
          if (isPeriod) {
            cellClass += ` ${styles.periodDay}`;
            if (prevPeriod && nextPeriod) cellClass += ` ${styles.periodMid}`;
            else if (prevPeriod) cellClass += ` ${styles.periodEnd}`;
            else if (nextPeriod) cellClass += ` ${styles.periodStart}`;
            else cellClass += ` ${styles.periodSingle}`;
          }

          return (
            <button
              key={i}
              onClick={() => {
                onSelectDate(day);
                if (!isSameMonth(day, currentMonth)) {
                  setCurrentMonth(startOfMonth(day));
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                onTogglePeriodDay(day);
              }}
              className={cellClass}
            >
              <span className={styles.dayNumber}>{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
