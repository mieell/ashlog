"use client";

import { useState } from "react";
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
  isAfter,
} from "date-fns";
import styles from "./logging.module.css";

interface PeriodLogFormProps {
  onSave: (data?: any) => void;
  onSkip: () => void;
  selectedDate?: Date;
  existingLog?: any;
  onDelete?: () => void;
}

const FLOW_OPTIONS = [
  { value: "spotting", label: "Spotting", emoji: "💧" },
  { value: "light", label: "Light", emoji: "🩸" },
  { value: "medium", label: "Medium", emoji: "🩸🩸" },
  { value: "heavy", label: "Heavy", emoji: "🩸🩸🩸" },
];

export default function PeriodLogForm({
  onSave,
  onSkip,
  selectedDate: initialDate = new Date(),
  existingLog,
  onDelete,
}: PeriodLogFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [calendarMonth, setCalendarMonth] = useState<Date>(initialDate);
  const [flow, setFlow] = useState(existingLog?.flow || "medium");
  const [clotting, setClotting] = useState(existingLog?.clotting || false);
  const [cramping, setCramping] = useState(existingLog?.cramping || 0);
  const [notes, setNotes] = useState(existingLog?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow,
          clotting,
          cramping: cramping || null,
          notes: notes || null,
          date: selectedDate.toISOString(),
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || `Save failed (${res.status})`);
      }
      onSave(resData);
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
      setSaving(false);
    }
  }

  // ── Build calendar grid ──
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return (
    <div className={styles.form}>
      {error && <div className={styles.formError}>{error}</div>}

      {/* ── Inline Calendar Picker ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Period Date</label>
        <div className={styles.miniCalendar}>
          {/* Month navigation */}
          <div className={styles.miniCalHeader}>
            <button
              type="button"
              className={styles.miniCalNav}
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              ‹
            </button>
            <span className={styles.miniCalMonth}>
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              className={styles.miniCalNav}
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className={styles.miniCalDayNames}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className={styles.miniCalDayName}>
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className={styles.miniCalGrid}>
            {weeks.map((week, wi) =>
              week.map((d, di) => {
                const inMonth = isSameMonth(d, calendarMonth);
                const isSelected = isSameDay(d, selectedDate);
                const isToday = isSameDay(d, today);
                const isFuture = isAfter(d, today);
                return (
                  <button
                    key={`${wi}-${di}`}
                    type="button"
                    disabled={isFuture}
                    className={[
                      styles.miniCalDay,
                      !inMonth ? styles.miniCalDayOther : "",
                      isSelected ? styles.miniCalDaySelected : "",
                      isToday && !isSelected ? styles.miniCalDayToday : "",
                      isFuture ? styles.miniCalDayDisabled : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (!isFuture) setSelectedDate(d);
                    }}
                  >
                    {format(d, "d")}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Selected date badge ── */}
      <div className={styles.selectedDateBadge}>
        🗓 Logging for{" "}
        <strong>{format(selectedDate, "EEEE, MMM d, yyyy")}</strong>
      </div>

      {/* ── Flow Selection ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Flow Intensity</label>
        <div className={styles.chipGrid}>
          {FLOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`chip ${flow === opt.value ? "active" : ""}`}
              onClick={() => setFlow(opt.value)}
              type="button"
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clotting ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Clotting</label>
        <div className={styles.chipGrid}>
          <button
            className={`chip ${clotting ? "active" : ""}`}
            onClick={() => setClotting(true)}
            type="button"
          >
            Yes
          </button>
          <button
            className={`chip ${!clotting ? "active" : ""}`}
            onClick={() => setClotting(false)}
            type="button"
          >
            No
          </button>
        </div>
      </div>

      {/* ── Cramping ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Cramping Intensity
          {cramping > 0 && (
            <span className={styles.fieldValue}>{cramping}/5</span>
          )}
        </label>
        <div className={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`${styles.sliderDot} ${
                cramping >= val ? styles.sliderDotActive : ""
              }`}
              onClick={() => setCramping(val === cramping ? 0 : val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Notes (optional)</label>
        <textarea
          className="input textarea"
          placeholder="Anything you'd like to note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {/* ── Actions ── */}
      <div
        className={styles.formActions}
        style={{
          justifyContent: existingLog ? "space-between" : "flex-end",
          width: "100%",
        }}
      >
        {existingLog && onDelete ? (
          <button
            className="btn btn-ghost"
            onClick={() => {
              onDelete();
              onSkip();
            }}
            type="button"
            style={{ color: "var(--color-danger)" }}
          >
            Remove Period
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={onSkip} type="button">
            Skip
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving
            ? "Saving..."
            : existingLog
            ? "Update Period"
            : "Log Period"}
        </button>
      </div>
    </div>
  );
}
