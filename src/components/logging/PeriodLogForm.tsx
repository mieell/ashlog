"use client";

import { useState } from "react";
import styles from "./logging.module.css";

interface PeriodLogFormProps {
  onSave: () => void;
  onSkip: () => void;
}

const FLOW_OPTIONS = [
  { value: "spotting", label: "Spotting", emoji: "💧" },
  { value: "light", label: "Light", emoji: "🩸" },
  { value: "medium", label: "Medium", emoji: "🩸🩸" },
  { value: "heavy", label: "Heavy", emoji: "🩸🩸🩸" },
];

export default function PeriodLogForm({ onSave, onSkip }: PeriodLogFormProps) {
  const [flow, setFlow] = useState("medium");
  const [clotting, setClotting] = useState(false);
  const [cramping, setCramping] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow,
          clotting,
          cramping: cramping || null,
          notes: notes || null,
          date: new Date().toISOString(),
        }),
      });
      onSave();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      {/* Flow Selection — primary required field */}
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

      {/* Clotting */}
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

      {/* Cramping */}
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
              className={`${styles.sliderDot} ${cramping >= val ? styles.sliderDotActive : ""}`}
              onClick={() => setCramping(val === cramping ? 0 : val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
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

      {/* Actions */}
      <div className={styles.formActions}>
        <button className="btn btn-ghost" onClick={onSkip} type="button">
          Skip
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? "Saving..." : "Log Period"}
        </button>
      </div>
    </div>
  );
}
