"use client";

import { useState } from "react";
import styles from "./logging.module.css";

interface SymptomLogFormProps {
  onSave: () => void;
  onSkip: () => void;
  selectedDate?: Date;
}

const SYMPTOM_OPTIONS = [
  "Headache",
  "Bloating",
  "Cramps",
  "Fatigue",
  "Breast tenderness",
  "Nausea",
  "Back pain",
  "Acne",
  "Mood swings",
  "Food cravings",
  "Dizziness",
  "Insomnia",
];

const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];
const TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"];

export default function SymptomLogForm({ onSave, onSkip, selectedDate = new Date() }: SymptomLogFormProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [timeOfDay, setTimeOfDay] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSymptom(symptom: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[symptom]) {
        delete next[symptom];
      } else {
        next[symptom] = "Mild";
      }
      return next;
    });
  }

  function setSeverity(symptom: string, severity: string) {
    setSelected((prev) => ({ ...prev, [symptom]: severity }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const symptoms = Object.entries(selected).map(([name, severity]) => ({
      name,
      severity,
    }));
    try {
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          timeOfDay: timeOfDay || null,
          notes: notes || null,
          date: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save symptom log.");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSaving(false);
    }
  }

  const selectedSymptoms = Object.keys(selected);

  return (
    <div className={styles.form}>
      {/* Symptom Multi-Select */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Symptoms
          {selectedSymptoms.length > 0 && (
            <span className={styles.fieldValue}>
              {selectedSymptoms.length} selected
            </span>
          )}
        </label>
        <div className={styles.chipGridWrap}>
          {SYMPTOM_OPTIONS.map((symptom) => (
            <button
              key={symptom}
              className={`chip ${selected[symptom] ? "active" : ""}`}
              onClick={() => toggleSymptom(symptom)}
              type="button"
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Severity per selected symptom */}
      {selectedSymptoms.length > 0 && (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Severity</label>
          <div className={styles.severityList}>
            {selectedSymptoms.map((symptom) => (
              <div key={symptom} className={styles.severityRow}>
                <span className={styles.severityName}>{symptom}</span>
                <div className={styles.severityChips}>
                  {SEVERITY_OPTIONS.map((sev) => (
                    <button
                      key={sev}
                      className={`chip ${selected[symptom] === sev ? "active" : ""} ${
                        sev === "Severe" ? "chip-danger" : ""
                      }`}
                      onClick={() => setSeverity(symptom, sev)}
                      type="button"
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time of Day */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Time of Day</label>
        <div className={styles.chipGrid}>
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              className={`chip ${timeOfDay === time.toLowerCase() ? "active" : ""}`}
              onClick={() =>
                setTimeOfDay(
                  timeOfDay === time.toLowerCase() ? "" : time.toLowerCase()
                )
              }
              type="button"
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Notes (optional)</label>
        <textarea
          className="input textarea"
          placeholder="Anything else to note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.formActions}>
        <button className="btn btn-ghost" onClick={onSkip} type="button">
          Skip
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || selectedSymptoms.length === 0}
          type="button"
        >
          {saving ? "Saving..." : "Log Symptoms"}
        </button>
      </div>
    </div>
  );
}
