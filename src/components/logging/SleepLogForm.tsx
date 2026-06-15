"use client";

import { useState } from "react";
import styles from "./logging.module.css";

interface SleepLogFormProps {
  onSave: () => void;
  onSkip: () => void;
}

const DISTURBANCE_OPTIONS = [
  "Insomnia",
  "Restless",
  "Woke up",
  "Nightmares",
  "Hot flashes",
  "Pain",
];

export default function SleepLogForm({ onSave, onSkip }: SleepLogFormProps) {
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState(3);
  const [freshness, setFreshness] = useState(3);
  const [disturbances, setDisturbances] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleDisturbance(item: string) {
    setDisturbances((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  }

  function getDuration(): string {
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    let totalMin = (wh * 60 + wm) - (bh * 60 + bm);
    if (totalMin < 0) totalMin += 24 * 60;
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours}h ${mins}m`;
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date();
    const [bh, bm] = bedtime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);

    const bedDate = new Date(today);
    bedDate.setHours(bh, bm, 0, 0);
    if (bh > 12) bedDate.setDate(bedDate.getDate() - 1);

    const wakeDate = new Date(today);
    wakeDate.setHours(wh, wm, 0, 0);

    try {
      await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: bedDate.toISOString(),
          wakeTime: wakeDate.toISOString(),
          quality,
          freshness,
          disturbances,
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
      {/* Times */}
      <div className={styles.timeRow}>
        <div className={styles.timeField}>
          <label className={styles.fieldLabel}>Bedtime</label>
          <input
            type="time"
            className="input"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
          />
        </div>
        <div className={styles.timeDuration}>
          <span className={styles.durationValue}>{getDuration()}</span>
          <span className={styles.durationLabel}>Duration</span>
        </div>
        <div className={styles.timeField}>
          <label className={styles.fieldLabel}>Wake time</label>
          <input
            type="time"
            className="input"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
          />
        </div>
      </div>

      {/* Quality */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Sleep Quality
          <span className={styles.fieldValue}>{quality}/5</span>
        </label>
        <div className={styles.starRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`${styles.star} ${quality >= val ? styles.starActive : ""}`}
              onClick={() => setQuality(val)}
              type="button"
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Morning Freshness */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Morning Freshness
          <span className={styles.fieldValue}>{freshness}/5</span>
        </label>
        <div className={styles.sliderRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              className={`${styles.sliderDot} ${freshness >= val ? styles.sliderDotActive : ""}`}
              onClick={() => setFreshness(val)}
              type="button"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Disturbances */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Disturbances</label>
        <div className={styles.chipGridWrap}>
          {DISTURBANCE_OPTIONS.map((item) => (
            <button
              key={item}
              className={`chip ${disturbances.includes(item) ? "active" : ""}`}
              onClick={() => toggleDisturbance(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
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
          {saving ? "Saving..." : "Log Sleep"}
        </button>
      </div>
    </div>
  );
}
