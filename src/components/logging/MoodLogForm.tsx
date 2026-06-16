"use client";

import { useState } from "react";
import styles from "./logging.module.css";

interface MoodLogFormProps {
  onSave: () => void;
  onSkip: () => void;
}

const MOOD_OPTIONS = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "irritable", emoji: "😤", label: "Irritable" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "energized", emoji: "⚡", label: "Energized" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed" },
];

export default function MoodLogForm({ onSave, onSkip }: MoodLogFormProps) {
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: mood || "calm",
          energy,
          stress,
          notes: notes || null,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save mood log.");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      {/* Mood Selector — primary required field */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>How are you feeling?</label>
        <div className={styles.emojiGrid}>
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.emojiButton} ${mood === opt.value ? styles.emojiActive : ""}`}
              onClick={() => setMood(opt.value)}
              type="button"
            >
              <span className={styles.emojiIcon}>{opt.emoji}</span>
              <span className={styles.emojiLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Energy Level
          <span className={styles.fieldValue}>{energy}/5</span>
        </label>
        <div className={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`${styles.sliderDot} ${energy >= val ? styles.sliderDotActive : ""}`}
              onClick={() => setEnergy(val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
        <div className={styles.sliderLabels}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Stress Level */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Stress Level
          <span className={styles.fieldValue}>{stress}/5</span>
        </label>
        <div className={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`${styles.sliderDot} ${styles.sliderDotStress} ${stress >= val ? styles.sliderDotStressActive : ""}`}
              onClick={() => setStress(val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
        <div className={styles.sliderLabels}>
          <span>Relaxed</span>
          <span>Stressed</span>
        </div>
      </div>

      {/* Notes */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Note (optional)</label>
        <textarea
          className="input textarea"
          placeholder="What's on your mind..."
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
          disabled={saving || !mood}
          type="button"
        >
          {saving ? "Saving..." : "Log Mood"}
        </button>
      </div>
    </div>
  );
}
