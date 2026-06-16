"use client";

import { useState } from "react";
import styles from "./logging.module.css";

interface JournalFormProps {
  onSave: () => void;
  onSkip: () => void;
}

const MOOD_TAGS = ["😊 Happy", "😌 Calm", "😰 Anxious", "😢 Sad", "😴 Tired"];
const SYMPTOM_TAGS = ["Cramps", "Headache", "Bloating", "Fatigue", "Nausea"];

export default function JournalForm({ onSave, onSkip }: JournalFormProps) {
  const [content, setContent] = useState("");
  const [moodTag, setMoodTag] = useState("");
  const [symptomTag, setSymptomTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, moodTag: moodTag || null, symptomTag: symptomTag || null, date: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save journal entry.");
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>What&apos;s on your mind? <span className={styles.fieldHint}>🔒 Always private</span></label>
        <textarea className="input textarea" placeholder="Write freely — your journal is never used for AI training..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} autoFocus />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Mood tag (optional)</label>
        <div className={styles.chipGridWrap}>
          {MOOD_TAGS.map((tag) => (<button key={tag} className={`chip ${moodTag === tag ? "active" : ""}`} onClick={() => setMoodTag(moodTag === tag ? "" : tag)} type="button">{tag}</button>))}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Symptom tag (optional)</label>
        <div className={styles.chipGridWrap}>
          {SYMPTOM_TAGS.map((tag) => (<button key={tag} className={`chip ${symptomTag === tag ? "active" : ""}`} onClick={() => setSymptomTag(symptomTag === tag ? "" : tag)} type="button">{tag}</button>))}
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <div className={styles.formActions}>
        <button className="btn btn-ghost" onClick={onSkip} type="button">Skip</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !content.trim()} type="button">{saving ? "Saving..." : "Save Entry"}</button>
      </div>
    </div>
  );
}
